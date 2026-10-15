# Sube las capturas de store/ a la ficha de addons.mozilla.org, respetando el límite de AMO
# (~1 subida cada 40 min), pone sus textos y avisa por ntfy al terminar.
# Las claves llegan por variables de entorno (AMO_KEY, AMO_SECRET); no se guardan en disco.
import hmac, hashlib, base64, json, time, uuid, urllib.request, re, os, subprocess, sys
KEY, SECRET = os.environ['AMO_KEY'], os.environ['AMO_SECRET']
STORE = os.path.join(os.path.dirname(__file__), '..', 'store')
LOG = os.path.join(STORE, '..', 'dist', 'amo-previews.log')
API = 'https://addons.mozilla.org/api/v5/addons/addon/drawingamemaps/'
CAPS = [('screenshot-1-draw.png', 'Draw routes, areas and notes on the whole map', 'Dibuja rutas, zonas y notas sobre el mapa entero'),
        ('screenshot-3-detect.png', 'Detects how the site serves its map', 'Detecta cómo sirve la web su mapa'),
        ('screenshot-2-levels.png', 'Choose the level of detail to download', 'Elige el nivel de detalle a descargar'),
        ('screenshot-4-share.png', 'Copy it into Discord or TeamSpeak, or download it', 'Cópialo a Discord o TeamSpeak, o descárgalo'),
        ('screenshot-5-gallery.png', 'All your maps, saved in your browser', 'Todos tus mapas, guardados en tu navegador')]

def log(*a):
    with open(LOG, 'a', encoding='utf-8') as f: f.write(time.strftime('%H:%M:%S ') + ' '.join(map(str, a)) + '\n')

def b64(b): return base64.urlsafe_b64encode(b).rstrip(b'=').decode()
def jwt():
    now = int(time.time()); h = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    p = b64(json.dumps({'iss': KEY, 'jti': str(uuid.uuid4()), 'iat': now, 'exp': now + 60}).encode())
    return f'{h}.{p}.' + b64(hmac.new(SECRET.encode(), f'{h}.{p}'.encode(), hashlib.sha256).digest())

def call(url, data=None, headers={}, method='GET'):
    for _ in range(40):
        r = urllib.request.Request(url, data=data, method=method, headers={'Authorization': 'JWT ' + jwt(), **headers})
        try:
            with urllib.request.urlopen(r, timeout=120) as resp: return resp.status, json.loads(resp.read() or b'{}')
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if e.code == 429:
                m = re.search(r'in (\d+) second', body); w = int(m.group(1)) + 5 if m else 300
                log('limitado, espero', w, 's'); time.sleep(w); continue
            return e.code, body[:300]
        except Exception as e:
            log('error de red', e); time.sleep(60)
    return 0, 'demasiados reintentos'

def notify(msg):
    subprocess.run(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File',
                    r'C:\Users\javimental\Scripts\notify.ps1', '-Title', 'drawingamemaps · Mozilla', '-Message', msg, '-Reintentos', '3'])

log('inicio')
st, a = call(API)
have = {p['position']: p for p in a.get('previews', [])} if isinstance(a, dict) else {}
for i, (f, en, es) in enumerate(CAPS):
    p = have.get(i)
    if p and (p.get('caption') or {}).get('en-US'): log(f, 'ya estaba'); continue
    pid = p['id'] if p else None
    if pid is None:
        bnd = uuid.uuid4().hex
        body = (f'--{bnd}\r\nContent-Disposition: form-data; name="position"\r\n\r\n{i}\r\n'
                f'--{bnd}\r\nContent-Disposition: form-data; name="image"; filename="{f}"\r\nContent-Type: image/png\r\n\r\n').encode() \
            + open(os.path.join(STORE, f), 'rb').read() + f'\r\n--{bnd}--\r\n'.encode()
        st, r = call(API + 'previews/', body, {'Content-Type': f'multipart/form-data; boundary={bnd}'}, 'POST')
        if st not in (200, 201): log(f, 'fallo al subir', st, r); continue
        pid = r['id']
    st, r = call(f'{API}previews/{pid}/', json.dumps({'caption': {'en-US': en, 'es-ES': es}}).encode(), {'Content-Type': 'application/json'}, 'PATCH')
    log(f, 'subida, id', pid, 'texto', st)
st, a = call(API)
n = len(a.get('previews', [])) if isinstance(a, dict) else '?'
log('fin:', n, 'capturas')
notify(f'Capturas de la ficha de Mozilla subidas: {n} de {len(CAPS)}. La extensión sigue en revisión.')
