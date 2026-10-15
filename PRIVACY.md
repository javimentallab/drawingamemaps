# Privacy policy — drawingamemaps

*Last updated: 15 October 2026*

**drawingamemaps does not collect, store on any server, sell or share any personal data.** It has no analytics, no tracking and no account.

## What stays on your device

- The maps you download and the drawings you make are saved only in your browser's local storage (IndexedDB), so you can reopen them from "My maps". Deleting a map, or uninstalling the extension, removes them.

## What it connects to

- Only the map websites you choose. When you ask for the whole map, the extension downloads the map images (tiles, a single image or an SVG file) from that site, exactly as the site itself does when you browse it, sending that site as the `Referer` so the download is allowed.
- Nothing is sent anywhere else. There is no server operated by the developer.

## Permissions and why

| Permission | Why |
|---|---|
| `activeTab`, `scripting` | When you click the extension, read which map images the current page has loaded, and take a screenshot for "Just what's visible". |
| Access to a site (asked for each site, optional) | Download the map images from the map site you chose. |
| `declarativeNetRequestWithHostAccess` | Send the map site as `Referer` while downloading, because many map sites block downloads without it. Applies only to the extension's own download tab. |
| `storage`, `unlimitedStorage` | Keep your maps and drawings locally; whole maps can be large. |
| `contextMenus` | "My maps" entry on the extension icon. |
| `clipboardWrite` | Copy the drawn map so you can paste it into Discord, TeamSpeak, etc. |

## Contact

Open an issue at https://github.com/javimentallab/drawingamemaps/issues

---

**Resumen en español:** drawingamemaps no recoge ni envía ningún dato personal. Los mapas y dibujos se guardan solo en tu navegador. Solo se conecta a las webs de mapas que tú eliges, para descargar sus imágenes.
