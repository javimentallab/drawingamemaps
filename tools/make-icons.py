# Dibuja el icono de drawingamemaps (mapa plegado + ruta roja + chincheta) y lo exporta a varios tamaños.
# Uso: python tools/make-icons.py
from PIL import Image, ImageDraw
import os
S = 1024
im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.rounded_rectangle([40, 40, S - 40, S - 40], radius=210, fill=(24, 32, 48, 255))
# mapa plegado en tres paneles
P = [(190, 300), (400, 230), (624, 300), (834, 230), (834, 760), (624, 830), (400, 760), (190, 830)]
panels = [[P[0], P[1], P[6], P[7]], [P[1], P[2], P[5], P[6]], [P[2], P[3], P[4], P[5]]]
cols = [(214, 196, 150, 255), (190, 172, 128, 255), (214, 196, 150, 255)]
for pts, c in zip(panels, cols):
    d.polygon(pts, fill=c)
# manchas de terreno
d.ellipse([240, 420, 380, 560], fill=(120, 150, 90, 255))
d.ellipse([650, 560, 790, 700], fill=(120, 150, 90, 255))
d.polygon([(470, 330), (560, 380), (540, 470), (450, 430)], fill=(90, 140, 190, 255))
# ruta dibujada a mano (roja, gruesa)
route = [(250, 720), (330, 650), (420, 660), (500, 560), (590, 540), (660, 440), (740, 400)]
d.line(route, fill=(255, 59, 48, 255), width=46, joint='curve')
for x, y in (route[0], route[-1]):
    d.ellipse([x - 23, y - 23, x + 23, y + 23], fill=(255, 59, 48, 255))
# chincheta al final de la ruta
cx, cy = 740, 330
d.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(255, 214, 10, 255), outline=(24, 32, 48, 255), width=14)
d.polygon([(cx - 34, cy + 52), (cx + 34, cy + 52), (cx, cy + 130)], fill=(255, 214, 10, 255))
d.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(24, 32, 48, 255))
out = os.path.join(os.path.dirname(__file__), '..', 'src', 'icons')
for n in (16, 32, 48, 128):
    im.resize((n, n), Image.LANCZOS).save(os.path.join(out, f'icon-{n}.png'))
im.resize((512, 512), Image.LANCZOS).save(os.path.join(os.path.dirname(__file__), '..', 'store', 'icon-512.png') if os.path.isdir(os.path.join(os.path.dirname(__file__), '..', 'store')) else os.path.join(out, '..', '..', 'icon-512.png'))
print('iconos ok')
