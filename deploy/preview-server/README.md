# Preview server (Mac mini M4)

Serves two things to external testers over your static IP, both behind the
same basic auth:

- Android preview APKs at `/latest.apk`
- the web build of the app at `/web/` (the GitHub repo is private and Pages
  needs a paid plan for private repos, so the web demo lives here)

iOS is **not** self-hosted here — use TestFlight for it (self-hosted
ad-hoc distribution needs per-device UDID registration and a manifest
`.plist` over a trusted cert; TestFlight is far less friction for the
same result).

## One-time setup on the Mac mini

1. Prevent the machine from sleeping (it's a server now):
   ```bash
   sudo pmset -a sleep 0 disksleep 0
   ```
2. Point your domain's A record at the static IP, and forward ports
   80/443 on the network to this Mac.
3. Install Caddy:
   ```bash
   brew install caddy
   ```
4. Create the serving directories:
   ```bash
   sudo mkdir -p /srv/defuckto/builds/archive /srv/defuckto/logs
   sudo chown -R "$(whoami)" /srv/defuckto
   cp Caddyfile /srv/defuckto/Caddyfile
   ```
5. Generate a password hash for testers and drop it into the plist:
   ```bash
   caddy hash-password
   ```
   Copy the template and edit the copy (the real file is git-ignored so
   the hash never lands in git):
   ```bash
   cp com.defuckto.previewserver.plist.template com.defuckto.previewserver.plist
   ```
   In `com.defuckto.previewserver.plist` set `PREVIEW_DOMAIN` to your real
   domain and `TESTERS_PASSWORD_HASH` to the hash above.
6. Install the launchd service so Caddy survives reboots/crashes:
   ```bash
   cp com.defuckto.previewserver.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.defuckto.previewserver.plist
   ```
7. Install the EAS CLI and log in once:
   ```bash
   npm install -g eas-cli
   eas login
   ```

## Publishing a new build

From the project root, after making changes.

**Android APK:**
```bash
PREVIEW_DOMAIN=preview.defuckto.example ./deploy/preview-server/publish-build.sh
```
This builds the Android APK locally (using the M4's own cores, no EAS
cloud queue) and drops it at `https://<PREVIEW_DOMAIN>/latest.apk`
(basic-auth protected), keeping a timestamped copy under `/archive/`.

Testers: open the link on the Android device, enter the shared
credentials, download, and allow install from unknown sources.

**Web build:**
```bash
PREVIEW_DOMAIN=preview.defuckto.example ./deploy/preview-server/publish-web.sh
```
This exports the web build and replaces `https://<PREVIEW_DOMAIN>/web/`
(same basic auth). Nothing is published from GitHub Actions; CI only checks
that the code typechecks, the tests pass and the web export builds.
