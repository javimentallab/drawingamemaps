# Translations beyond English and Spanish, read by tools/i18n-messages.py.
# One "key|text" per line; $1, $2… are placeholders and must match the English text.
# Shortcut letters (G, H, P, L…) stay the same in every language: they are the keys.

LANGS = {}

LANGS['pt_BR'] = """
extDesc|Baixe o mapa inteiro de sites de mapas de videogames e desenhe nele com zoom e deslocamento.
cmdDesc|Abrir drawingamemaps
menuMyMaps|Meus mapas
searching|Procurando o mapa…
hint|O mapa não sai inteiro? Mova ou dê zoom no mapa e abra isto de novo, ou toque em “Recarregar e analisar”.
reload|Recarregar e analisar
reloadTitle|Recarrega a página observando desde o início quais imagens ela carrega
noAccess|Esta página não pode ser lida (páginas internas do navegador, loja de extensões…).
optTiles|Mapa inteiro
optTilesSub|blocos de $1 · $2 vistos
optSvg|Mapa vetorial (SVG)
optSvgSub|$1 · $2 KB · amplia sem perder nitidez
optImage|Imagem completa $1
optCapture|Só o que está visível
optCaptureSub|captura da tela atual
errorX|Erro: $1
needPerm|Para baixar o mapa, é preciso permissão para ler $1.
grant|Dar permissão
permDenied|Sem essa permissão o mapa não pode ser baixado. Você pode voltar e usar “Só o que está visível”.
dlImage|Baixando a imagem…
errNoImage|O servidor não devolveu a imagem.
preparing|Preparando o mapa: $1 / $2
dlSvg|Baixando o mapa vetorial…
errStatus|O servidor respondeu $1.
errSvg|O arquivo não é um SVG válido.
errSvgSize|Não é possível saber o tamanho deste SVG.
svgPick|É um mapa vetorial: dá para ampliar o quanto quiser. Escolha a resolução máxima.
nTiles|$1 blocos
analyzing|Analisando o mapa…
analyzingN|Analisando o mapa… ($1 testes)
errNoTiles|O servidor não devolve os blocos deste mapa.
pickLevel|Escolha o nível de detalhe. Mais detalhe = mais zoom sem pixelar, mas um download maior.
noEdges|O mapa parece não ter bordas; a área foi limitada.
level|Nível $1 · $2
levelSub|≤$1 blocos · $2
dlLevel|Baixando o nível $1 de $2: $3 / $4
errNoLevel|Não foi possível baixar nenhum bloco do nível escolhido.
assembling|Montando o mapa…
dlGrid|Baixando a grade de blocos…
dlGridN|Baixando a grade de blocos: $1
errTiles|Não consegui interpretar os blocos deste site. Tente “Só o que está visível”.
download|Baixar
cancel|Cancelar
close|Fechar
confirmClear|Apagar todos os traços deste mapa?
copied|Imagem copiada. Cole no Discord, TeamSpeak, WhatsApp… com Ctrl+V.
copyFail|Não foi possível copiar: $1
noShare|Este navegador não pode compartilhar arquivos. Use “Copiar” e cole com Ctrl+V.
shareFail|Não foi possível compartilhar: $1
assemblingFull|Montando o mapa inteiro…
downloaded|Baixado.
fullSuffix| (inteiro)
deleteMap|Apagar mapa
confirmDelete|Apagar “$1” e seus traços?
noMaps|Ainda não há mapas.
untitled|Sem nome
empty|Abra um mapa e pressione Alt+Shift+M (ou o ícone da extensão).
tGallery|Meus mapas (G)
tPan|Mover (H) · também Espaço, botão direito ou botão do meio
tPen|Lápis (P)
tLine|Linha (L) · Shift fixa o ângulo
tArrow|Seta (A) · Shift fixa o ângulo
tRect|Retângulo (R) · Shift = quadrado
tCircle|Círculo (C)
tText|Texto (T)
tErase|Apagar traço (E)
tColor|Outra cor
tWidth|Espessura
tUndo|Desfazer (Ctrl+Z)
tRedo|Refazer (Ctrl+Y)
tFit|Ajustar (F)
tClear|Apagar todos os traços
tShare|Copiar, baixar ou compartilhar (Ctrl+C copia o que está visível)
tSource|Abrir o site original
mCopyView|📋 Copiar o que está visível
mCopyFull|📋 Copiar o mapa inteiro
mDlView|⬇ Baixar o que está visível
mDlFull|⬇ Baixar o mapa inteiro
mShare|📤 Compartilhar o que está visível…
mHint|Para Discord, TeamSpeak ou WhatsApp: copie e cole no chat com Ctrl+V.
"""

LANGS['fr'] = """
extDesc|Téléchargez la carte entière des sites de cartes de jeux vidéo et dessinez dessus avec zoom et défilement.
cmdDesc|Ouvrir drawingamemaps
menuMyMaps|Mes cartes
searching|Recherche de la carte…
hint|La carte n’apparaît pas en entier ? Déplacez ou zoomez la carte et rouvrez ceci, ou appuyez sur « Recharger et analyser ».
reload|Recharger et analyser
reloadTitle|Recharge la page en observant dès le début les images qu’elle charge
noAccess|Cette page ne peut pas être lue (pages internes du navigateur, boutique d’extensions…).
optTiles|Carte entière
optTilesSub|tuiles de $1 · $2 vues
optSvg|Carte vectorielle (SVG)
optSvgSub|$1 · $2 Ko · s’agrandit sans perdre en netteté
optImage|Image complète $1
optCapture|Seulement ce qui est visible
optCaptureSub|capture de l’écran actuel
errorX|Erreur : $1
needPerm|Pour télécharger la carte, il faut l’autorisation de lire $1.
grant|Autoriser
permDenied|Sans cette autorisation, la carte ne peut pas être téléchargée. Vous pouvez revenir et utiliser « Seulement ce qui est visible ».
dlImage|Téléchargement de l’image…
errNoImage|Le serveur n’a pas renvoyé l’image.
preparing|Préparation de la carte : $1 / $2
dlSvg|Téléchargement de la carte vectorielle…
errStatus|Le serveur a répondu $1.
errSvg|Le fichier n’est pas un SVG valide.
errSvgSize|Impossible de connaître la taille de ce SVG.
svgPick|C’est une carte vectorielle : on peut l’agrandir autant qu’on veut. Choisissez la résolution maximale.
nTiles|$1 tuiles
analyzing|Analyse de la carte…
analyzingN|Analyse de la carte… ($1 essais)
errNoTiles|Le serveur ne renvoie pas les tuiles de cette carte.
pickLevel|Choisissez le niveau de détail. Plus de détail = plus de zoom sans pixellisation, mais un téléchargement plus lourd.
noEdges|La carte ne semble pas avoir de bords ; la zone a été limitée.
level|Niveau $1 · $2
levelSub|≤$1 tuiles · $2
dlLevel|Téléchargement du niveau $1 sur $2 : $3 / $4
errNoLevel|Impossible de télécharger la moindre tuile du niveau choisi.
assembling|Assemblage de la carte…
dlGrid|Téléchargement de la grille de tuiles…
dlGridN|Téléchargement de la grille de tuiles : $1
errTiles|Je n’ai pas su interpréter les tuiles de ce site. Essayez « Seulement ce qui est visible ».
download|Télécharger
cancel|Annuler
close|Fermer
confirmClear|Effacer tous les tracés de cette carte ?
copied|Image copiée. Collez-la dans Discord, TeamSpeak, WhatsApp… avec Ctrl+V.
copyFail|Copie impossible : $1
noShare|Ce navigateur ne peut pas partager de fichiers. Utilisez « Copier » et collez avec Ctrl+V.
shareFail|Partage impossible : $1
assemblingFull|Assemblage de la carte entière…
downloaded|Téléchargé.
fullSuffix| (entière)
deleteMap|Supprimer la carte
confirmDelete|Supprimer « $1 » et ses tracés ?
noMaps|Aucune carte pour l’instant.
untitled|Sans titre
empty|Ouvrez une carte et appuyez sur Alt+Shift+M (ou sur l’icône de l’extension).
tGallery|Mes cartes (G)
tPan|Déplacer (H) · aussi Espace, clic droit ou clic molette
tPen|Crayon (P)
tLine|Ligne (L) · Maj fixe l’angle
tArrow|Flèche (A) · Maj fixe l’angle
tRect|Rectangle (R) · Maj = carré
tCircle|Cercle (C)
tText|Texte (T)
tErase|Effacer un tracé (E)
tColor|Autre couleur
tWidth|Épaisseur
tUndo|Annuler (Ctrl+Z)
tRedo|Rétablir (Ctrl+Y)
tFit|Ajuster (F)
tClear|Effacer tous les tracés
tShare|Copier, télécharger ou partager (Ctrl+C copie ce qui est visible)
tSource|Ouvrir le site d’origine
mCopyView|📋 Copier ce qui est visible
mCopyFull|📋 Copier la carte entière
mDlView|⬇ Télécharger ce qui est visible
mDlFull|⬇ Télécharger la carte entière
mShare|📤 Partager ce qui est visible…
mHint|Pour Discord, TeamSpeak ou WhatsApp : copiez et collez dans la discussion avec Ctrl+V.
"""

LANGS['de'] = """
extDesc|Lade die ganze Karte von Videospiel-Kartenseiten herunter und zeichne darauf, mit Zoom und Verschieben.
cmdDesc|drawingamemaps öffnen
menuMyMaps|Meine Karten
searching|Suche die Karte…
hint|Die Karte kommt nicht ganz? Verschiebe oder zoome die Karte und öffne dies erneut, oder klicke auf „Neu laden und analysieren“.
reload|Neu laden und analysieren
reloadTitle|Lädt die Seite neu und beobachtet von Anfang an, welche Bilder sie lädt
noAccess|Diese Seite lässt sich nicht lesen (interne Browserseiten, Erweiterungsshop…).
optTiles|Ganze Karte
optTilesSub|Kacheln von $1 · $2 gesehen
optSvg|Vektorkarte (SVG)
optSvgSub|$1 · $2 KB · vergrößerbar ohne Schärfeverlust
optImage|Ganzes Bild $1
optCapture|Nur das Sichtbare
optCaptureSub|Bildschirmfoto der aktuellen Ansicht
errorX|Fehler: $1
needPerm|Zum Herunterladen der Karte wird die Berechtigung benötigt, $1 zu lesen.
grant|Berechtigung erteilen
permDenied|Ohne diese Berechtigung kann die Karte nicht heruntergeladen werden. Du kannst zurückgehen und „Nur das Sichtbare“ nutzen.
dlImage|Lade das Bild herunter…
errNoImage|Der Server hat das Bild nicht geliefert.
preparing|Bereite die Karte vor: $1 / $2
dlSvg|Lade die Vektorkarte herunter…
errStatus|Der Server hat mit $1 geantwortet.
errSvg|Die Datei ist kein gültiges SVG.
errSvgSize|Die Größe dieses SVG ist nicht zu ermitteln.
svgPick|Es ist eine Vektorkarte: Du kannst sie beliebig vergrößern. Wähle die maximale Auflösung.
nTiles|$1 Kacheln
analyzing|Analysiere die Karte…
analyzingN|Analysiere die Karte… ($1 Versuche)
errNoTiles|Der Server liefert die Kacheln dieser Karte nicht.
pickLevel|Wähle die Detailstufe. Mehr Detail = mehr Zoom ohne Verpixeln, aber ein größerer Download.
noEdges|Die Karte scheint keine Ränder zu haben; der Bereich wurde begrenzt.
level|Stufe $1 · $2
levelSub|≤$1 Kacheln · $2
dlLevel|Lade Stufe $1 von $2: $3 / $4
errNoLevel|Von der gewählten Stufe ließ sich keine einzige Kachel herunterladen.
assembling|Setze die Karte zusammen…
dlGrid|Lade das Kachelraster herunter…
dlGridN|Lade das Kachelraster herunter: $1
errTiles|Die Kacheln dieser Seite konnte ich nicht deuten. Versuch es mit „Nur das Sichtbare“.
download|Herunterladen
cancel|Abbrechen
close|Schließen
confirmClear|Alle Striche auf dieser Karte löschen?
copied|Bild kopiert. Füge es mit Strg+V in Discord, TeamSpeak, WhatsApp… ein.
copyFail|Kopieren fehlgeschlagen: $1
noShare|Dieser Browser kann keine Dateien teilen. Nutze „Kopieren“ und füge mit Strg+V ein.
shareFail|Teilen fehlgeschlagen: $1
assemblingFull|Setze die ganze Karte zusammen…
downloaded|Heruntergeladen.
fullSuffix| (ganz)
deleteMap|Karte löschen
confirmDelete|„$1“ und seine Striche löschen?
noMaps|Noch keine Karten.
untitled|Ohne Namen
empty|Öffne eine Karte und drücke Alt+Umschalt+M (oder das Symbol der Erweiterung).
tGallery|Meine Karten (G)
tPan|Verschieben (H) · auch Leertaste, rechte oder mittlere Maustaste
tPen|Stift (P)
tLine|Linie (L) · Umschalt rastet den Winkel ein
tArrow|Pfeil (A) · Umschalt rastet den Winkel ein
tRect|Rechteck (R) · Umschalt = Quadrat
tCircle|Kreis (C)
tText|Text (T)
tErase|Strich löschen (E)
tColor|Andere Farbe
tWidth|Stärke
tUndo|Rückgängig (Strg+Z)
tRedo|Wiederholen (Strg+Y)
tFit|Einpassen (F)
tClear|Alle Striche löschen
tShare|Kopieren, herunterladen oder teilen (Strg+C kopiert das Sichtbare)
tSource|Originalseite öffnen
mCopyView|📋 Das Sichtbare kopieren
mCopyFull|📋 Die ganze Karte kopieren
mDlView|⬇ Das Sichtbare herunterladen
mDlFull|⬇ Die ganze Karte herunterladen
mShare|📤 Das Sichtbare teilen…
mHint|Für Discord, TeamSpeak oder WhatsApp: kopieren und mit Strg+V in den Chat einfügen.
"""

LANGS['it'] = """
extDesc|Scarica la mappa intera dai siti di mappe dei videogiochi e disegnaci sopra con zoom e spostamento.
cmdDesc|Apri drawingamemaps
menuMyMaps|Le mie mappe
searching|Cerco la mappa…
hint|La mappa non esce intera? Sposta o ingrandisci la mappa e riapri questo, oppure premi “Ricarica e analizza”.
reload|Ricarica e analizza
reloadTitle|Ricarica la pagina osservando dall’inizio quali immagini carica
noAccess|Questa pagina non si può leggere (pagine interne del browser, negozio di estensioni…).
optTiles|Mappa intera
optTilesSub|tessere da $1 · $2 viste
optSvg|Mappa vettoriale (SVG)
optSvgSub|$1 · $2 KB · si ingrandisce senza perdere nitidezza
optImage|Immagine completa $1
optCapture|Solo ciò che si vede
optCaptureSub|cattura della schermata attuale
errorX|Errore: $1
needPerm|Per scaricare la mappa serve il permesso di leggere $1.
grant|Concedi permesso
permDenied|Senza quel permesso la mappa non si può scaricare. Puoi tornare indietro e usare “Solo ciò che si vede”.
dlImage|Scarico l’immagine…
errNoImage|Il server non ha restituito l’immagine.
preparing|Preparo la mappa: $1 / $2
dlSvg|Scarico la mappa vettoriale…
errStatus|Il server ha risposto $1.
errSvg|Il file non è un SVG valido.
errSvgSize|Impossibile sapere le dimensioni di questo SVG.
svgPick|È una mappa vettoriale: puoi ingrandirla quanto vuoi. Scegli la risoluzione massima.
nTiles|$1 tessere
analyzing|Analizzo la mappa…
analyzingN|Analizzo la mappa… ($1 prove)
errNoTiles|Il server non restituisce le tessere di questa mappa.
pickLevel|Scegli il livello di dettaglio. Più dettaglio = più zoom senza pixel, ma un download più grande.
noEdges|La mappa sembra non avere bordi; l’area è stata limitata.
level|Livello $1 · $2
levelSub|≤$1 tessere · $2
dlLevel|Scarico il livello $1 di $2: $3 / $4
errNoLevel|Non è stato possibile scaricare nessuna tessera del livello scelto.
assembling|Monto la mappa…
dlGrid|Scarico la griglia di tessere…
dlGridN|Scarico la griglia di tessere: $1
errTiles|Non sono riuscito a interpretare le tessere di questo sito. Prova “Solo ciò che si vede”.
download|Scarica
cancel|Annulla
close|Chiudi
confirmClear|Cancellare tutti i tratti di questa mappa?
copied|Immagine copiata. Incollala in Discord, TeamSpeak, WhatsApp… con Ctrl+V.
copyFail|Impossibile copiare: $1
noShare|Questo browser non può condividere file. Usa “Copia” e incolla con Ctrl+V.
shareFail|Impossibile condividere: $1
assemblingFull|Monto la mappa intera…
downloaded|Scaricato.
fullSuffix| (intera)
deleteMap|Elimina mappa
confirmDelete|Eliminare “$1” e i suoi tratti?
noMaps|Ancora nessuna mappa.
untitled|Senza nome
empty|Apri una mappa e premi Alt+Shift+M (o l’icona dell’estensione).
tGallery|Le mie mappe (G)
tPan|Sposta (H) · anche Spazio, tasto destro o tasto centrale
tPen|Matita (P)
tLine|Linea (L) · Shift blocca l’angolo
tArrow|Freccia (A) · Shift blocca l’angolo
tRect|Rettangolo (R) · Shift = quadrato
tCircle|Cerchio (C)
tText|Testo (T)
tErase|Cancella tratto (E)
tColor|Altro colore
tWidth|Spessore
tUndo|Annulla (Ctrl+Z)
tRedo|Ripeti (Ctrl+Y)
tFit|Adatta (F)
tClear|Cancella tutti i tratti
tShare|Copia, scarica o condividi (Ctrl+C copia ciò che si vede)
tSource|Apri il sito originale
mCopyView|📋 Copia ciò che si vede
mCopyFull|📋 Copia la mappa intera
mDlView|⬇ Scarica ciò che si vede
mDlFull|⬇ Scarica la mappa intera
mShare|📤 Condividi ciò che si vede…
mHint|Per Discord, TeamSpeak o WhatsApp: copia e incolla nella chat con Ctrl+V.
"""

LANGS['nl'] = """
extDesc|Download de hele kaart van kaartsites voor videogames en teken erop, met zoomen en verschuiven.
cmdDesc|drawingamemaps openen
menuMyMaps|Mijn kaarten
searching|Kaart zoeken…
hint|Komt de kaart niet helemaal mee? Verschuif of zoom de kaart en open dit opnieuw, of klik op ‘Herladen en analyseren’.
reload|Herladen en analyseren
reloadTitle|Herlaadt de pagina en kijkt vanaf het begin welke afbeeldingen ze laadt
noAccess|Deze pagina kan niet gelezen worden (interne browserpagina’s, extensiewinkel…).
optTiles|Hele kaart
optTilesSub|tegels van $1 · $2 gezien
optSvg|Vectorkaart (SVG)
optSvgSub|$1 · $2 KB · vergroot zonder scherpte te verliezen
optImage|Volledige afbeelding $1
optCapture|Alleen wat zichtbaar is
optCaptureSub|schermafbeelding van het huidige beeld
errorX|Fout: $1
needPerm|Om de kaart te downloaden is toestemming nodig om $1 te lezen.
grant|Toestemming geven
permDenied|Zonder die toestemming kan de kaart niet worden gedownload. Je kunt teruggaan en ‘Alleen wat zichtbaar is’ gebruiken.
dlImage|Afbeelding downloaden…
errNoImage|De server heeft de afbeelding niet teruggestuurd.
preparing|Kaart voorbereiden: $1 / $2
dlSvg|Vectorkaart downloaden…
errStatus|De server antwoordde $1.
errSvg|Het bestand is geen geldige SVG.
errSvgSize|De grootte van deze SVG is niet te bepalen.
svgPick|Het is een vectorkaart: je kunt zo ver inzoomen als je wilt. Kies de maximale resolutie.
nTiles|$1 tegels
analyzing|Kaart analyseren…
analyzingN|Kaart analyseren… ($1 pogingen)
errNoTiles|De server geeft de tegels van deze kaart niet terug.
pickLevel|Kies het detailniveau. Meer detail = meer zoom zonder pixels, maar een grotere download.
noEdges|De kaart lijkt geen randen te hebben; het gebied is begrensd.
level|Niveau $1 · $2
levelSub|≤$1 tegels · $2
dlLevel|Niveau $1 van $2 downloaden: $3 / $4
errNoLevel|Er kon geen enkele tegel van het gekozen niveau worden gedownload.
assembling|Kaart samenstellen…
dlGrid|Tegelraster downloaden…
dlGridN|Tegelraster downloaden: $1
errTiles|Ik kon de tegels van deze site niet ontcijferen. Probeer ‘Alleen wat zichtbaar is’.
download|Downloaden
cancel|Annuleren
close|Sluiten
confirmClear|Alle lijnen op deze kaart wissen?
copied|Afbeelding gekopieerd. Plak hem in Discord, TeamSpeak, WhatsApp… met Ctrl+V.
copyFail|Kopiëren mislukt: $1
noShare|Deze browser kan geen bestanden delen. Gebruik ‘Kopiëren’ en plak met Ctrl+V.
shareFail|Delen mislukt: $1
assemblingFull|Hele kaart samenstellen…
downloaded|Gedownload.
fullSuffix| (heel)
deleteMap|Kaart verwijderen
confirmDelete|‘$1’ en de lijnen erop verwijderen?
noMaps|Nog geen kaarten.
untitled|Naamloos
empty|Open een kaart en druk op Alt+Shift+M (of op het pictogram van de extensie).
tGallery|Mijn kaarten (G)
tPan|Verschuiven (H) · ook spatie, rechter- of middelste muisknop
tPen|Potlood (P)
tLine|Lijn (L) · Shift zet de hoek vast
tArrow|Pijl (A) · Shift zet de hoek vast
tRect|Rechthoek (R) · Shift = vierkant
tCircle|Cirkel (C)
tText|Tekst (T)
tErase|Lijn wissen (E)
tColor|Andere kleur
tWidth|Dikte
tUndo|Ongedaan maken (Ctrl+Z)
tRedo|Opnieuw (Ctrl+Y)
tFit|Passend maken (F)
tClear|Alle lijnen wissen
tShare|Kopiëren, downloaden of delen (Ctrl+C kopieert wat zichtbaar is)
tSource|Originele site openen
mCopyView|📋 Kopieer wat zichtbaar is
mCopyFull|📋 Kopieer de hele kaart
mDlView|⬇ Download wat zichtbaar is
mDlFull|⬇ Download de hele kaart
mShare|📤 Deel wat zichtbaar is…
mHint|Voor Discord, TeamSpeak of WhatsApp: kopieer en plak in de chat met Ctrl+V.
"""

LANGS['pl'] = """
extDesc|Pobierz całą mapę ze stron z mapami gier i rysuj na niej z powiększaniem i przesuwaniem.
cmdDesc|Otwórz drawingamemaps
menuMyMaps|Moje mapy
searching|Szukam mapy…
hint|Mapa nie wychodzi cała? Przesuń lub przybliż mapę i otwórz to ponownie albo kliknij „Przeładuj i przeanalizuj”.
reload|Przeładuj i przeanalizuj
reloadTitle|Przeładowuje stronę, obserwując od początku, jakie obrazy wczytuje
noAccess|Tej strony nie da się odczytać (wewnętrzne strony przeglądarki, sklep z rozszerzeniami…).
optTiles|Cała mapa
optTilesSub|kafelki z $1 · widziane: $2
optSvg|Mapa wektorowa (SVG)
optSvgSub|$1 · $2 KB · powiększa się bez utraty ostrości
optImage|Pełny obraz $1
optCapture|Tylko to, co widać
optCaptureSub|zrzut bieżącego widoku
errorX|Błąd: $1
needPerm|Aby pobrać mapę, potrzebne jest uprawnienie do odczytu $1.
grant|Udziel uprawnienia
permDenied|Bez tego uprawnienia mapy nie da się pobrać. Możesz wrócić i użyć „Tylko to, co widać”.
dlImage|Pobieram obraz…
errNoImage|Serwer nie zwrócił obrazu.
preparing|Przygotowuję mapę: $1 / $2
dlSvg|Pobieram mapę wektorową…
errStatus|Serwer odpowiedział $1.
errSvg|Plik nie jest poprawnym SVG.
errSvgSize|Nie da się ustalić rozmiaru tego SVG.
svgPick|To mapa wektorowa: możesz ją powiększać, ile chcesz. Wybierz maksymalną rozdzielczość.
nTiles|Kafelki: $1
analyzing|Analizuję mapę…
analyzingN|Analizuję mapę… (próby: $1)
errNoTiles|Serwer nie zwraca kafelków tej mapy.
pickLevel|Wybierz poziom szczegółów. Więcej szczegółów = większe przybliżenie bez pikseli, ale większe pobieranie.
noEdges|Mapa chyba nie ma krawędzi; obszar został ograniczony.
level|Poziom $1 · $2
levelSub|≤$1 kafelków · $2
dlLevel|Pobieram poziom $1 z $2: $3 / $4
errNoLevel|Nie udało się pobrać żadnego kafelka z wybranego poziomu.
assembling|Składam mapę…
dlGrid|Pobieram siatkę kafelków…
dlGridN|Pobieram siatkę kafelków: $1
errTiles|Nie udało mi się zrozumieć kafelków tej strony. Spróbuj „Tylko to, co widać”.
download|Pobierz
cancel|Anuluj
close|Zamknij
confirmClear|Usunąć wszystkie linie z tej mapy?
copied|Obraz skopiowany. Wklej go w Discordzie, TeamSpeaku, WhatsAppie… przez Ctrl+V.
copyFail|Nie udało się skopiować: $1
noShare|Ta przeglądarka nie może udostępniać plików. Użyj „Kopiuj” i wklej przez Ctrl+V.
shareFail|Nie udało się udostępnić: $1
assemblingFull|Składam całą mapę…
downloaded|Pobrano.
fullSuffix| (cała)
deleteMap|Usuń mapę
confirmDelete|Usunąć „$1” i jej linie?
noMaps|Nie ma jeszcze map.
untitled|Bez nazwy
empty|Otwórz mapę i naciśnij Alt+Shift+M (albo ikonę rozszerzenia).
tGallery|Moje mapy (G)
tPan|Przesuń (H) · także spacja, prawy lub środkowy przycisk
tPen|Ołówek (P)
tLine|Linia (L) · Shift blokuje kąt
tArrow|Strzałka (A) · Shift blokuje kąt
tRect|Prostokąt (R) · Shift = kwadrat
tCircle|Okrąg (C)
tText|Tekst (T)
tErase|Usuń linię (E)
tColor|Inny kolor
tWidth|Grubość
tUndo|Cofnij (Ctrl+Z)
tRedo|Ponów (Ctrl+Y)
tFit|Dopasuj (F)
tClear|Usuń wszystkie linie
tShare|Kopiuj, pobierz lub udostępnij (Ctrl+C kopiuje to, co widać)
tSource|Otwórz oryginalną stronę
mCopyView|📋 Kopiuj to, co widać
mCopyFull|📋 Kopiuj całą mapę
mDlView|⬇ Pobierz to, co widać
mDlFull|⬇ Pobierz całą mapę
mShare|📤 Udostępnij to, co widać…
mHint|Dla Discorda, TeamSpeaka lub WhatsAppa: skopiuj i wklej do czatu przez Ctrl+V.
"""

LANGS['ru'] = """
extDesc|Скачивайте карту целиком с сайтов карт видеоигр и рисуйте на ней с масштабированием и прокруткой.
cmdDesc|Открыть drawingamemaps
menuMyMaps|Мои карты
searching|Ищу карту…
hint|Карта выходит не целиком? Сдвиньте или приблизьте карту и откройте это снова либо нажмите «Перезагрузить и проанализировать».
reload|Перезагрузить и проанализировать
reloadTitle|Перезагружает страницу и с самого начала следит, какие изображения она загружает
noAccess|Эту страницу нельзя прочитать (внутренние страницы браузера, магазин расширений…).
optTiles|Вся карта
optTilesSub|тайлы с $1 · видно: $2
optSvg|Векторная карта (SVG)
optSvgSub|$1 · $2 КБ · увеличивается без потери чёткости
optImage|Полное изображение $1
optCapture|Только видимое
optCaptureSub|снимок текущего экрана
errorX|Ошибка: $1
needPerm|Чтобы скачать карту, нужно разрешение на чтение $1.
grant|Дать разрешение
permDenied|Без этого разрешения карту скачать нельзя. Можно вернуться и выбрать «Только видимое».
dlImage|Скачиваю изображение…
errNoImage|Сервер не вернул изображение.
preparing|Готовлю карту: $1 / $2
dlSvg|Скачиваю векторную карту…
errStatus|Сервер ответил $1.
errSvg|Файл не является корректным SVG.
errSvgSize|Не удаётся определить размер этого SVG.
svgPick|Это векторная карта: её можно увеличивать сколько угодно. Выберите максимальное разрешение.
nTiles|Тайлов: $1
analyzing|Анализирую карту…
analyzingN|Анализирую карту… (проб: $1)
errNoTiles|Сервер не отдаёт тайлы этой карты.
pickLevel|Выберите уровень детализации. Больше деталей = больше зума без пикселей, но больше загрузка.
noEdges|Похоже, у карты нет краёв; область ограничена.
level|Уровень $1 · $2
levelSub|≤$1 тайлов · $2
dlLevel|Скачиваю уровень $1 из $2: $3 / $4
errNoLevel|Не удалось скачать ни одного тайла выбранного уровня.
assembling|Собираю карту…
dlGrid|Скачиваю сетку тайлов…
dlGridN|Скачиваю сетку тайлов: $1
errTiles|Не удалось разобраться в тайлах этого сайта. Попробуйте «Только видимое».
download|Скачать
cancel|Отмена
close|Закрыть
confirmClear|Удалить все линии на этой карте?
copied|Изображение скопировано. Вставьте его в Discord, TeamSpeak, WhatsApp… через Ctrl+V.
copyFail|Не удалось скопировать: $1
noShare|Этот браузер не умеет делиться файлами. Используйте «Копировать» и вставьте через Ctrl+V.
shareFail|Не удалось поделиться: $1
assemblingFull|Собираю всю карту…
downloaded|Скачано.
fullSuffix| (целиком)
deleteMap|Удалить карту
confirmDelete|Удалить «$1» вместе с линиями?
noMaps|Карт пока нет.
untitled|Без названия
empty|Откройте карту и нажмите Alt+Shift+M (или значок расширения).
tGallery|Мои карты (G)
tPan|Сдвиг (H) · также пробел, правая или средняя кнопка мыши
tPen|Карандаш (P)
tLine|Линия (L) · Shift фиксирует угол
tArrow|Стрелка (A) · Shift фиксирует угол
tRect|Прямоугольник (R) · Shift = квадрат
tCircle|Круг (C)
tText|Текст (T)
tErase|Стереть линию (E)
tColor|Другой цвет
tWidth|Толщина
tUndo|Отменить (Ctrl+Z)
tRedo|Повторить (Ctrl+Y)
tFit|Вписать (F)
tClear|Удалить все линии
tShare|Копировать, скачать или поделиться (Ctrl+C копирует видимое)
tSource|Открыть исходный сайт
mCopyView|📋 Копировать видимое
mCopyFull|📋 Копировать всю карту
mDlView|⬇ Скачать видимое
mDlFull|⬇ Скачать всю карту
mShare|📤 Поделиться видимым…
mHint|Для Discord, TeamSpeak или WhatsApp: скопируйте и вставьте в чат через Ctrl+V.
"""

LANGS['uk'] = """
extDesc|Завантажуйте мапу цілком із сайтів мап відеоігор і малюйте на ній із масштабуванням і прокручуванням.
cmdDesc|Відкрити drawingamemaps
menuMyMaps|Мої мапи
searching|Шукаю мапу…
hint|Мапа виходить не цілком? Посуньте або наблизьте мапу й відкрийте це знову або натисніть «Перезавантажити й проаналізувати».
reload|Перезавантажити й проаналізувати
reloadTitle|Перезавантажує сторінку й від самого початку стежить, які зображення вона завантажує
noAccess|Цю сторінку неможливо прочитати (внутрішні сторінки браузера, крамниця розширень…).
optTiles|Уся мапа
optTilesSub|тайли з $1 · видно: $2
optSvg|Векторна мапа (SVG)
optSvgSub|$1 · $2 КБ · збільшується без втрати чіткості
optImage|Повне зображення $1
optCapture|Лише видиме
optCaptureSub|знімок поточного екрана
errorX|Помилка: $1
needPerm|Щоб завантажити мапу, потрібен дозвіл на читання $1.
grant|Надати дозвіл
permDenied|Без цього дозволу мапу не завантажити. Можна повернутися й вибрати «Лише видиме».
dlImage|Завантажую зображення…
errNoImage|Сервер не повернув зображення.
preparing|Готую мапу: $1 / $2
dlSvg|Завантажую векторну мапу…
errStatus|Сервер відповів $1.
errSvg|Файл не є коректним SVG.
errSvgSize|Не вдається визначити розмір цього SVG.
svgPick|Це векторна мапа: її можна збільшувати скільки завгодно. Виберіть максимальну роздільність.
nTiles|Тайлів: $1
analyzing|Аналізую мапу…
analyzingN|Аналізую мапу… (спроб: $1)
errNoTiles|Сервер не віддає тайли цієї мапи.
pickLevel|Виберіть рівень деталізації. Більше деталей = більше зуму без пікселів, але більше завантаження.
noEdges|Схоже, у мапи немає країв; область обмежено.
level|Рівень $1 · $2
levelSub|≤$1 тайлів · $2
dlLevel|Завантажую рівень $1 із $2: $3 / $4
errNoLevel|Не вдалося завантажити жодного тайла вибраного рівня.
assembling|Збираю мапу…
dlGrid|Завантажую сітку тайлів…
dlGridN|Завантажую сітку тайлів: $1
errTiles|Не вдалося розібратися в тайлах цього сайту. Спробуйте «Лише видиме».
download|Завантажити
cancel|Скасувати
close|Закрити
confirmClear|Видалити всі лінії на цій мапі?
copied|Зображення скопійовано. Вставте його в Discord, TeamSpeak, WhatsApp… через Ctrl+V.
copyFail|Не вдалося скопіювати: $1
noShare|Цей браузер не вміє ділитися файлами. Скористайтеся «Копіювати» і вставте через Ctrl+V.
shareFail|Не вдалося поділитися: $1
assemblingFull|Збираю всю мапу…
downloaded|Завантажено.
fullSuffix| (цілком)
deleteMap|Видалити мапу
confirmDelete|Видалити «$1» разом із лініями?
noMaps|Мап ще немає.
untitled|Без назви
empty|Відкрийте мапу й натисніть Alt+Shift+M (або значок розширення).
tGallery|Мої мапи (G)
tPan|Зсув (H) · також пробіл, права або середня кнопка миші
tPen|Олівець (P)
tLine|Лінія (L) · Shift фіксує кут
tArrow|Стрілка (A) · Shift фіксує кут
tRect|Прямокутник (R) · Shift = квадрат
tCircle|Коло (C)
tText|Текст (T)
tErase|Стерти лінію (E)
tColor|Інший колір
tWidth|Товщина
tUndo|Скасувати (Ctrl+Z)
tRedo|Повторити (Ctrl+Y)
tFit|Вписати (F)
tClear|Видалити всі лінії
tShare|Копіювати, завантажити або поділитися (Ctrl+C копіює видиме)
tSource|Відкрити вихідний сайт
mCopyView|📋 Копіювати видиме
mCopyFull|📋 Копіювати всю мапу
mDlView|⬇ Завантажити видиме
mDlFull|⬇ Завантажити всю мапу
mShare|📤 Поділитися видимим…
mHint|Для Discord, TeamSpeak або WhatsApp: скопіюйте й вставте в чат через Ctrl+V.
"""

LANGS['zh_CN'] = """
extDesc|从游戏地图网站下载整张地图，并在上面绘制，支持缩放和平移。
cmdDesc|打开 drawingamemaps
menuMyMaps|我的地图
searching|正在查找地图…
hint|地图不完整？移动或缩放地图后再打开这里，或点击“重新加载并分析”。
reload|重新加载并分析
reloadTitle|重新加载页面，并从头观察它加载了哪些图片
noAccess|无法读取此页面（浏览器内部页面、扩展商店等）。
optTiles|整张地图
optTilesSub|来自 $1 的图块 · 已看到 $2
optSvg|矢量地图（SVG）
optSvgSub|$1 · $2 KB · 放大不失清晰度
optImage|完整图片 $1
optCapture|只要可见部分
optCaptureSub|当前画面截图
errorX|错误：$1
needPerm|下载地图需要读取 $1 的权限。
grant|授予权限
permDenied|没有该权限就无法下载地图。你可以返回并使用“只要可见部分”。
dlImage|正在下载图片…
errNoImage|服务器没有返回图片。
preparing|正在准备地图：$1 / $2
dlSvg|正在下载矢量地图…
errStatus|服务器返回了 $1。
errSvg|该文件不是有效的 SVG。
errSvgSize|无法得知此 SVG 的尺寸。
svgPick|这是矢量地图：可以随意放大。请选择最大分辨率。
nTiles|$1 个图块
analyzing|正在分析地图…
analyzingN|正在分析地图…（$1 次尝试）
errNoTiles|服务器不提供此地图的图块。
pickLevel|选择细节级别。细节越多 = 放大越不失真，但下载量越大。
noEdges|地图似乎没有边界；已限制区域。
level|级别 $1 · $2
levelSub|≤$1 个图块 · $2
dlLevel|正在下载第 $1 级（共 $2 级）：$3 / $4
errNoLevel|所选级别的图块一个也下载不了。
assembling|正在拼合地图…
dlGrid|正在下载图块网格…
dlGridN|正在下载图块网格：$1
errTiles|无法解析此网站的图块。试试“只要可见部分”。
download|下载
cancel|取消
close|关闭
confirmClear|删除此地图上的所有笔画？
copied|图片已复制。用 Ctrl+V 粘贴到 Discord、TeamSpeak、WhatsApp 等。
copyFail|无法复制：$1
noShare|此浏览器无法分享文件。请用“复制”，再用 Ctrl+V 粘贴。
shareFail|无法分享：$1
assemblingFull|正在拼合整张地图…
downloaded|已下载。
fullSuffix|（整张）
deleteMap|删除地图
confirmDelete|删除“$1”及其笔画？
noMaps|还没有地图。
untitled|未命名
empty|打开一张地图，然后按 Alt+Shift+M（或点击扩展图标）。
tGallery|我的地图 (G)
tPan|移动 (H) · 也可用空格、右键或中键
tPen|铅笔 (P)
tLine|直线 (L) · 按住 Shift 锁定角度
tArrow|箭头 (A) · 按住 Shift 锁定角度
tRect|矩形 (R) · Shift = 正方形
tCircle|圆形 (C)
tText|文字 (T)
tErase|擦除笔画 (E)
tColor|其他颜色
tWidth|粗细
tUndo|撤销 (Ctrl+Z)
tRedo|重做 (Ctrl+Y)
tFit|适应窗口 (F)
tClear|删除所有笔画
tShare|复制、下载或分享（Ctrl+C 复制可见部分）
tSource|打开原网站
mCopyView|📋 复制可见部分
mCopyFull|📋 复制整张地图
mDlView|⬇ 下载可见部分
mDlFull|⬇ 下载整张地图
mShare|📤 分享可见部分…
mHint|用于 Discord、TeamSpeak 或 WhatsApp：复制后在聊天中按 Ctrl+V 粘贴。
"""

LANGS['ja'] = """
extDesc|ゲームのマップサイトからマップ全体をダウンロードし、ズームやスクロールしながら上に描けます。
cmdDesc|drawingamemaps を開く
menuMyMaps|マイマップ
searching|マップを探しています…
hint|マップ全体が出ない？マップを動かすかズームしてからもう一度開くか、「再読み込みして解析」を押してください。
reload|再読み込みして解析
reloadTitle|ページを再読み込みし、最初から読み込まれる画像を監視します
noAccess|このページは読み取れません（ブラウザーの内部ページ、拡張機能ストアなど）。
optTiles|マップ全体
optTilesSub|$1 のタイル · 表示済み $2
optSvg|ベクターマップ（SVG）
optSvgSub|$1 · $2 KB · 拡大してもぼやけません
optImage|画像全体 $1
optCapture|見えている部分だけ
optCaptureSub|現在の画面のキャプチャ
errorX|エラー：$1
needPerm|マップをダウンロードするには $1 を読み取る権限が必要です。
grant|権限を許可
permDenied|その権限がないとマップをダウンロードできません。戻って「見えている部分だけ」を使えます。
dlImage|画像をダウンロード中…
errNoImage|サーバーが画像を返しませんでした。
preparing|マップを準備中：$1 / $2
dlSvg|ベクターマップをダウンロード中…
errStatus|サーバーの応答は $1 でした。
errSvg|このファイルは有効な SVG ではありません。
errSvgSize|この SVG のサイズがわかりません。
svgPick|ベクターマップなので、いくらでも拡大できます。最大解像度を選んでください。
nTiles|$1 タイル
analyzing|マップを解析中…
analyzingN|マップを解析中…（試行 $1 回）
errNoTiles|サーバーがこのマップのタイルを返しません。
pickLevel|詳細度を選んでください。詳細が多いほど粗くならずに拡大できますが、ダウンロードは大きくなります。
noEdges|マップに端がないようです。範囲を制限しました。
level|レベル $1 · $2
levelSub|≤$1 タイル · $2
dlLevel|レベル $1 / $2 をダウンロード中：$3 / $4
errNoLevel|選んだレベルのタイルを 1 枚もダウンロードできませんでした。
assembling|マップを組み立て中…
dlGrid|タイルのグリッドをダウンロード中…
dlGridN|タイルのグリッドをダウンロード中：$1
errTiles|このサイトのタイルを解釈できませんでした。「見えている部分だけ」を試してください。
download|ダウンロード
cancel|キャンセル
close|閉じる
confirmClear|このマップの線をすべて削除しますか？
copied|画像をコピーしました。Discord、TeamSpeak、WhatsApp などに Ctrl+V で貼り付けてください。
copyFail|コピーできませんでした：$1
noShare|このブラウザーはファイルを共有できません。「コピー」を使い、Ctrl+V で貼り付けてください。
shareFail|共有できませんでした：$1
assemblingFull|マップ全体を組み立て中…
downloaded|ダウンロードしました。
fullSuffix|（全体）
deleteMap|マップを削除
confirmDelete|「$1」とその線を削除しますか？
noMaps|まだマップがありません。
untitled|無題
empty|マップを開いて Alt+Shift+M（または拡張機能のアイコン）を押してください。
tGallery|マイマップ (G)
tPan|移動 (H) · スペース、右ボタン、中ボタンでも可
tPen|鉛筆 (P)
tLine|直線 (L) · Shift で角度を固定
tArrow|矢印 (A) · Shift で角度を固定
tRect|四角形 (R) · Shift = 正方形
tCircle|円 (C)
tText|テキスト (T)
tErase|線を消す (E)
tColor|別の色
tWidth|太さ
tUndo|元に戻す (Ctrl+Z)
tRedo|やり直す (Ctrl+Y)
tFit|全体を表示 (F)
tClear|線をすべて削除
tShare|コピー、ダウンロード、共有（Ctrl+C で見えている部分をコピー）
tSource|元のサイトを開く
mCopyView|📋 見えている部分をコピー
mCopyFull|📋 マップ全体をコピー
mDlView|⬇ 見えている部分をダウンロード
mDlFull|⬇ マップ全体をダウンロード
mShare|📤 見えている部分を共有…
mHint|Discord、TeamSpeak、WhatsApp なら：コピーしてチャットに Ctrl+V で貼り付け。
"""

LANGS['ko'] = """
extDesc|게임 지도 사이트에서 지도 전체를 내려받고, 확대와 이동을 하며 그 위에 그립니다.
cmdDesc|drawingamemaps 열기
menuMyMaps|내 지도
searching|지도를 찾는 중…
hint|지도가 전부 안 나오나요? 지도를 움직이거나 확대한 뒤 다시 열거나 ‘새로 고침 후 분석’을 누르세요.
reload|새로 고침 후 분석
reloadTitle|페이지를 새로 고치고 처음부터 어떤 이미지를 불러오는지 지켜봅니다
noAccess|이 페이지는 읽을 수 없습니다 (브라우저 내부 페이지, 확장 프로그램 스토어 등).
optTiles|지도 전체
optTilesSub|$1의 타일 · $2 확인됨
optSvg|벡터 지도 (SVG)
optSvgSub|$1 · $2 KB · 확대해도 선명함 유지
optImage|전체 이미지 $1
optCapture|보이는 부분만
optCaptureSub|현재 화면 캡처
errorX|오류: $1
needPerm|지도를 내려받으려면 $1을(를) 읽을 권한이 필요합니다.
grant|권한 허용
permDenied|그 권한 없이는 지도를 내려받을 수 없습니다. 돌아가서 ‘보이는 부분만’을 사용할 수 있습니다.
dlImage|이미지를 내려받는 중…
errNoImage|서버가 이미지를 돌려주지 않았습니다.
preparing|지도 준비 중: $1 / $2
dlSvg|벡터 지도를 내려받는 중…
errStatus|서버 응답: $1
errSvg|올바른 SVG 파일이 아닙니다.
errSvgSize|이 SVG의 크기를 알 수 없습니다.
svgPick|벡터 지도라서 원하는 만큼 확대할 수 있습니다. 최대 해상도를 고르세요.
nTiles|타일 $1개
analyzing|지도를 분석하는 중…
analyzingN|지도를 분석하는 중… (시도 $1회)
errNoTiles|서버가 이 지도의 타일을 주지 않습니다.
pickLevel|세부 수준을 고르세요. 세부가 많을수록 깨지지 않고 확대되지만 내려받을 양이 늘어납니다.
noEdges|지도에 가장자리가 없는 것 같아 범위를 제한했습니다.
level|수준 $1 · $2
levelSub|타일 ≤$1개 · $2
dlLevel|수준 $1/$2 내려받는 중: $3 / $4
errNoLevel|고른 수준의 타일을 하나도 내려받지 못했습니다.
assembling|지도를 합치는 중…
dlGrid|타일 격자를 내려받는 중…
dlGridN|타일 격자를 내려받는 중: $1
errTiles|이 사이트의 타일을 해석하지 못했습니다. ‘보이는 부분만’을 시도해 보세요.
download|내려받기
cancel|취소
close|닫기
confirmClear|이 지도의 선을 모두 지울까요?
copied|이미지를 복사했습니다. Discord, TeamSpeak, WhatsApp 등에 Ctrl+V로 붙여 넣으세요.
copyFail|복사하지 못했습니다: $1
noShare|이 브라우저는 파일을 공유할 수 없습니다. ‘복사’를 쓰고 Ctrl+V로 붙여 넣으세요.
shareFail|공유하지 못했습니다: $1
assemblingFull|지도 전체를 합치는 중…
downloaded|내려받았습니다.
fullSuffix| (전체)
deleteMap|지도 삭제
confirmDelete|‘$1’과(와) 그 선을 삭제할까요?
noMaps|아직 지도가 없습니다.
untitled|이름 없음
empty|지도를 열고 Alt+Shift+M(또는 확장 프로그램 아이콘)을 누르세요.
tGallery|내 지도 (G)
tPan|이동 (H) · 스페이스, 오른쪽 또는 가운데 버튼도 가능
tPen|연필 (P)
tLine|직선 (L) · Shift로 각도 고정
tArrow|화살표 (A) · Shift로 각도 고정
tRect|사각형 (R) · Shift = 정사각형
tCircle|원 (C)
tText|텍스트 (T)
tErase|선 지우기 (E)
tColor|다른 색
tWidth|굵기
tUndo|실행 취소 (Ctrl+Z)
tRedo|다시 실행 (Ctrl+Y)
tFit|화면에 맞춤 (F)
tClear|선 모두 지우기
tShare|복사, 내려받기 또는 공유 (Ctrl+C는 보이는 부분 복사)
tSource|원래 사이트 열기
mCopyView|📋 보이는 부분 복사
mCopyFull|📋 지도 전체 복사
mDlView|⬇ 보이는 부분 내려받기
mDlFull|⬇ 지도 전체 내려받기
mShare|📤 보이는 부분 공유…
mHint|Discord, TeamSpeak, WhatsApp용: 복사한 뒤 채팅에 Ctrl+V로 붙여 넣으세요.
"""

LANGS['th'] = """
extDesc|ดาวน์โหลดแผนที่ทั้งหมดจากเว็บแผนที่ของวิดีโอเกม แล้ววาดทับได้พร้อมซูมและเลื่อน
cmdDesc|เปิด drawingamemaps
menuMyMaps|แผนที่ของฉัน
searching|กำลังหาแผนที่…
hint|แผนที่ออกมาไม่ครบใช่ไหม ลองเลื่อนหรือซูมแผนที่แล้วเปิดอันนี้อีกครั้ง หรือกด “โหลดใหม่และวิเคราะห์”
reload|โหลดใหม่และวิเคราะห์
reloadTitle|โหลดหน้าใหม่และเฝ้าดูตั้งแต่ต้นว่าโหลดภาพอะไรบ้าง
noAccess|อ่านหน้านี้ไม่ได้ (หน้าภายในของเบราว์เซอร์ ร้านส่วนขยาย ฯลฯ)
optTiles|แผนที่ทั้งหมด
optTilesSub|ไทล์จาก $1 · เห็นแล้ว $2
optSvg|แผนที่เวกเตอร์ (SVG)
optSvgSub|$1 · $2 KB · ขยายได้โดยไม่เสียความคมชัด
optImage|ภาพเต็ม $1
optCapture|เฉพาะส่วนที่เห็น
optCaptureSub|จับภาพหน้าจอปัจจุบัน
errorX|ข้อผิดพลาด: $1
needPerm|ต้องได้รับสิทธิ์อ่าน $1 จึงจะดาวน์โหลดแผนที่ได้
grant|ให้สิทธิ์
permDenied|หากไม่มีสิทธิ์นั้นจะดาวน์โหลดแผนที่ไม่ได้ คุณกลับไปใช้ “เฉพาะส่วนที่เห็น” ได้
dlImage|กำลังดาวน์โหลดภาพ…
errNoImage|เซิร์ฟเวอร์ไม่ได้ส่งภาพกลับมา
preparing|กำลังเตรียมแผนที่: $1 / $2
dlSvg|กำลังดาวน์โหลดแผนที่เวกเตอร์…
errStatus|เซิร์ฟเวอร์ตอบกลับ $1
errSvg|ไฟล์นี้ไม่ใช่ SVG ที่ถูกต้อง
errSvgSize|ไม่ทราบขนาดของ SVG นี้
svgPick|นี่คือแผนที่เวกเตอร์ ขยายได้มากเท่าที่ต้องการ เลือกความละเอียดสูงสุด
nTiles|$1 ไทล์
analyzing|กำลังวิเคราะห์แผนที่…
analyzingN|กำลังวิเคราะห์แผนที่… (ลอง $1 ครั้ง)
errNoTiles|เซิร์ฟเวอร์ไม่ส่งไทล์ของแผนที่นี้
pickLevel|เลือกระดับรายละเอียด ยิ่งละเอียด = ซูมได้มากโดยไม่แตก แต่ดาวน์โหลดมากขึ้น
noEdges|แผนที่ดูเหมือนไม่มีขอบ จึงจำกัดพื้นที่ไว้
level|ระดับ $1 · $2
levelSub|≤$1 ไทล์ · $2
dlLevel|กำลังดาวน์โหลดระดับ $1 จาก $2: $3 / $4
errNoLevel|ดาวน์โหลดไทล์ของระดับที่เลือกไม่ได้เลย
assembling|กำลังประกอบแผนที่…
dlGrid|กำลังดาวน์โหลดตารางไทล์…
dlGridN|กำลังดาวน์โหลดตารางไทล์: $1
errTiles|ตีความไทล์ของเว็บนี้ไม่ได้ ลองใช้ “เฉพาะส่วนที่เห็น”
download|ดาวน์โหลด
cancel|ยกเลิก
close|ปิด
confirmClear|ลบเส้นทั้งหมดบนแผนที่นี้ไหม
copied|คัดลอกภาพแล้ว วางใน Discord, TeamSpeak, WhatsApp ฯลฯ ด้วย Ctrl+V
copyFail|คัดลอกไม่ได้: $1
noShare|เบราว์เซอร์นี้แชร์ไฟล์ไม่ได้ ใช้ “คัดลอก” แล้ววางด้วย Ctrl+V
shareFail|แชร์ไม่ได้: $1
assemblingFull|กำลังประกอบแผนที่ทั้งหมด…
downloaded|ดาวน์โหลดแล้ว
fullSuffix| (ทั้งหมด)
deleteMap|ลบแผนที่
confirmDelete|ลบ “$1” และเส้นของมันไหม
noMaps|ยังไม่มีแผนที่
untitled|ไม่มีชื่อ
empty|เปิดแผนที่แล้วกด Alt+Shift+M (หรือไอคอนของส่วนขยาย)
tGallery|แผนที่ของฉัน (G)
tPan|เลื่อน (H) · ใช้ Space ปุ่มขวา หรือปุ่มกลางก็ได้
tPen|ดินสอ (P)
tLine|เส้นตรง (L) · Shift ล็อกมุม
tArrow|ลูกศร (A) · Shift ล็อกมุม
tRect|สี่เหลี่ยม (R) · Shift = จัตุรัส
tCircle|วงกลม (C)
tText|ข้อความ (T)
tErase|ลบเส้น (E)
tColor|สีอื่น
tWidth|ความหนา
tUndo|เลิกทำ (Ctrl+Z)
tRedo|ทำซ้ำ (Ctrl+Y)
tFit|พอดีหน้าจอ (F)
tClear|ลบเส้นทั้งหมด
tShare|คัดลอก ดาวน์โหลด หรือแชร์ (Ctrl+C คัดลอกส่วนที่เห็น)
tSource|เปิดเว็บต้นฉบับ
mCopyView|📋 คัดลอกส่วนที่เห็น
mCopyFull|📋 คัดลอกแผนที่ทั้งหมด
mDlView|⬇ ดาวน์โหลดส่วนที่เห็น
mDlFull|⬇ ดาวน์โหลดแผนที่ทั้งหมด
mShare|📤 แชร์ส่วนที่เห็น…
mHint|สำหรับ Discord, TeamSpeak หรือ WhatsApp: คัดลอกแล้ววางในแชตด้วย Ctrl+V
"""

LANGS['hi'] = """
extDesc|वीडियो गेम के मैप वाली साइटों से पूरा मैप डाउनलोड करें और ज़ूम व खिसकाकर उस पर ड्रॉ करें।
cmdDesc|drawingamemaps खोलें
menuMyMaps|मेरे मैप
searching|मैप ढूँढ रहा है…
hint|पूरा मैप नहीं आ रहा? मैप को खिसकाएँ या ज़ूम करें और इसे फिर खोलें, या “फिर से लोड करें और जाँचें” दबाएँ।
reload|फिर से लोड करें और जाँचें
reloadTitle|पेज फिर से लोड करता है और शुरू से देखता है कि वह कौन-सी तस्वीरें लोड करता है
noAccess|यह पेज पढ़ा नहीं जा सकता (ब्राउज़र के अंदरूनी पेज, एक्सटेंशन स्टोर…)।
optTiles|पूरा मैप
optTilesSub|$1 से टाइलें · $2 देखी गईं
optSvg|वेक्टर मैप (SVG)
optSvgSub|$1 · $2 KB · बड़ा करने पर भी साफ़
optImage|पूरी तस्वीर $1
optCapture|सिर्फ़ जो दिख रहा है
optCaptureSub|अभी की स्क्रीन का स्क्रीनशॉट
errorX|त्रुटि: $1
needPerm|मैप डाउनलोड करने के लिए $1 पढ़ने की अनुमति चाहिए।
grant|अनुमति दें
permDenied|उस अनुमति के बिना मैप डाउनलोड नहीं हो सकता। आप वापस जाकर “सिर्फ़ जो दिख रहा है” चुन सकते हैं।
dlImage|तस्वीर डाउनलोड हो रही है…
errNoImage|सर्वर ने तस्वीर नहीं लौटाई।
preparing|मैप तैयार हो रहा है: $1 / $2
dlSvg|वेक्टर मैप डाउनलोड हो रहा है…
errStatus|सर्वर ने $1 जवाब दिया।
errSvg|यह फ़ाइल सही SVG नहीं है।
errSvgSize|इस SVG का आकार पता नहीं चल पा रहा।
svgPick|यह वेक्टर मैप है: इसे जितना चाहें बड़ा कर सकते हैं। सबसे ज़्यादा रेज़ोल्यूशन चुनें।
nTiles|$1 टाइलें
analyzing|मैप की जाँच हो रही है…
analyzingN|मैप की जाँच हो रही है… ($1 प्रयास)
errNoTiles|सर्वर इस मैप की टाइलें नहीं देता।
pickLevel|डिटेल का स्तर चुनें। ज़्यादा डिटेल = बिना धुँधलाए ज़्यादा ज़ूम, पर ज़्यादा डाउनलोड।
noEdges|लगता है मैप के किनारे नहीं हैं; इलाका सीमित कर दिया गया है।
level|स्तर $1 · $2
levelSub|≤$1 टाइलें · $2
dlLevel|स्तर $1 / $2 डाउनलोड हो रहा है: $3 / $4
errNoLevel|चुने गए स्तर की एक भी टाइल डाउनलोड नहीं हो सकी।
assembling|मैप जोड़ा जा रहा है…
dlGrid|टाइलों का ग्रिड डाउनलोड हो रहा है…
dlGridN|टाइलों का ग्रिड डाउनलोड हो रहा है: $1
errTiles|इस साइट की टाइलें समझ नहीं आईं। “सिर्फ़ जो दिख रहा है” आज़माएँ।
download|डाउनलोड करें
cancel|रद्द करें
close|बंद करें
confirmClear|इस मैप की सारी लकीरें मिटाएँ?
copied|तस्वीर कॉपी हो गई। उसे Discord, TeamSpeak, WhatsApp… में Ctrl+V से चिपकाएँ।
copyFail|कॉपी नहीं हो सका: $1
noShare|यह ब्राउज़र फ़ाइलें शेयर नहीं कर सकता। “कॉपी” इस्तेमाल करें और Ctrl+V से चिपकाएँ।
shareFail|शेयर नहीं हो सका: $1
assemblingFull|पूरा मैप जोड़ा जा रहा है…
downloaded|डाउनलोड हो गया।
fullSuffix| (पूरा)
deleteMap|मैप मिटाएँ
confirmDelete|“$1” और उसकी लकीरें मिटाएँ?
noMaps|अभी कोई मैप नहीं।
untitled|बिना नाम
empty|कोई मैप खोलें और Alt+Shift+M (या एक्सटेंशन का आइकन) दबाएँ।
tGallery|मेरे मैप (G)
tPan|खिसकाएँ (H) · स्पेस, दायाँ या बीच का बटन भी
tPen|पेंसिल (P)
tLine|रेखा (L) · Shift से कोण तय
tArrow|तीर (A) · Shift से कोण तय
tRect|आयत (R) · Shift = वर्ग
tCircle|वृत्त (C)
tText|टेक्स्ट (T)
tErase|लकीर मिटाएँ (E)
tColor|दूसरा रंग
tWidth|मोटाई
tUndo|पूर्ववत करें (Ctrl+Z)
tRedo|फिर से करें (Ctrl+Y)
tFit|फ़िट करें (F)
tClear|सारी लकीरें मिटाएँ
tShare|कॉपी, डाउनलोड या शेयर करें (Ctrl+C दिख रहा हिस्सा कॉपी करता है)
tSource|मूल साइट खोलें
mCopyView|📋 दिख रहा हिस्सा कॉपी करें
mCopyFull|📋 पूरा मैप कॉपी करें
mDlView|⬇ दिख रहा हिस्सा डाउनलोड करें
mDlFull|⬇ पूरा मैप डाउनलोड करें
mShare|📤 दिख रहा हिस्सा शेयर करें…
mHint|Discord, TeamSpeak या WhatsApp के लिए: कॉपी करें और चैट में Ctrl+V से चिपकाएँ।
"""
