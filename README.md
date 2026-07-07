# Send to MeTube

A small Firefox extension that adds a **"Send to MeTube"** right-click menu for
sending pages, links, and videos to your own [MeTube](https://github.com/alexta69/metube)
instance for download. It's the MeTube bookmarklet wrapped in a context menu,
with a quality submenu and a configurable instance URL.

Right-click gives the most specific URL available:
- on a **link** → the link target
- on a **video/audio** element → the media source
- on **empty page space** → the page URL

…and a **quality submenu**: Best / 1080p / 720p / 480p / Audio only.

## Configure

On first install the options page opens automatically. Enter your MeTube base
URL (e.g. `https://metube.example.com`) and click **Save** — Firefox will ask
permission to reach that host. The extension POSTs to `<url>/add`.

You can reopen it any time: `about:addons` → **Send to MeTube** → **Options**.

## Install

### Single-file package (recommended)
Grab the `.xpi` from the repo's Releases, or build it:

```sh
zip -r -FS ../send-to-metube.xpi . -x '*.git*' 'README.md' 'build.sh'
```

Then in Firefox: `about:addons` → gear ⚙ → **Install Add-on From File…** →
pick the `.xpi`.

- On **release** Firefox, unsigned add-ons are blocked from permanent install;
  either sign it (see below) or use temporary loading.
- On **Developer Edition / ESR / Nightly**, set
  `xpinstall.signatures.required = false` in `about:config` first, then the
  `.xpi` installs permanently.

### Temporary (any Firefox, gone on restart)
`about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** →
select `manifest.json`.

### Self-sign for release Firefox (stays private to you)
1. Get API credentials: https://addons.mozilla.org/developers/addon/api/key/
2. `npx web-ext sign --channel=unlisted --api-key=... --api-secret=...`
3. Install the signed `.xpi` it produces.

## Customize
Edit `background.js`:
- `QUALITIES` — the submenu entries. Each is `{ id, title, quality }` with an
  optional `format` (e.g. `mp3`); both are sent to MeTube's `/add` verbatim.

## Files
- `manifest.json` — extension manifest (MV3)
- `background.js` — context menu + POST logic
- `options.html` / `options.js` — instance URL settings
- `icon.svg` — toolbar/menu icon
