# CLAUDE.md

A small personal Firefox (MV3) extension: a "Send to MeTube" right-click menu
that POSTs a URL to a user-configured [MeTube](https://github.com/alexta69/metube)
instance for download. Not a build-tooled project — plain HTML/JS loaded directly.

## Files
- `manifest.json` — MV3 manifest. `version` here is only a local-loading default;
  the released version comes from the git tag (see Releasing).
- `background.js` — context menu + quality submenu + POST to `<instance>/add`.
- `options.html` / `options.js` — settings pane (embedded in `about:addons`);
  stores the instance URL in `storage.local` and requests host permission for it.
- `icon.svg`, `README.md`, `build.sh` (local packaging), `.github/workflows/release.yml`.

## Releasing (the only ritual)
Push a `v*` tag; CI does the rest. **The tag is the single source of truth for
the version** — the workflow stamps it into `manifest.json` before building, so
you do NOT hand-edit the version.

    git tag -a v1.4 -m v1.4 && git push origin v1.4   # annotated tag required

CI then: stamps version → builds `send-to-metube.xpi` → (if AMO secrets set)
signs `send-to-metube-signed.xpi` → creates a GitHub Release with both attached.

- **Versions must be unique and increasing.** AMO refuses to re-sign an existing
  version, and signing runs before the release step, so a reused version fails
  the whole release. Always pick a new, higher `vX.Y`.
- This git requires **annotated** tags (`-a -m`); a lightweight `git tag vX.Y` errors.

## Distribution & AMO
- Signed on the **unlisted** channel (self-distribution) — NOT store-listed.
- AMO add-on ID **3035255**, extension id `metube-sender@armsaw.net`. Changing the
  extension id makes Firefox treat it as a different add-on and starts a new AMO
  entry — avoid.
- The signed `.xpi` installs permanently on release Firefox; the unsigned one only
  on Developer Edition/ESR/Nightly with `xpinstall.signatures.required=false`.

## Security note (public repo)
The repo is public. AMO API credentials live in GitHub Actions secrets
(`AMO_JWT_ISSUER`, `AMO_JWT_SECRET`) and are safe **only because the workflow
triggers on `push:` tags** — fork PRs never receive secrets. Do NOT add a
`pull_request` / `pull_request_target` trigger that runs PR-supplied code; that
would expose the secrets. No instance URL or secret is stored in the repo.
