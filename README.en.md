# PokeMulti

[Português](README.md) · **English** · [⬇ Download the latest version](../../releases/latest)

Multi-account manager for **[PokeIdle](https://pokeidle.io)** on Windows: play **up to 4 sessions at once in a single window**, each with its own login and its own data.

> Unofficial fan project. Not affiliated with PokeIdle, Nintendo, Game Freak, Creatures, or The Pokémon Company.

<!-- Screenshots (real ones, no account data): ![Session grid](docs/grid.png) ![Lives window](docs/lives.png) -->

## Features

- Up to **4 sessions** in a grid, with separate logins and data for each.
- **Bottom bar** with one tab per session: show only one, rename, mute, zoom, reload, own window, and close.
- **Right-click** menu (on a tab or inside the game) with the same actions and a few more.
- **Close a session without losing its login**: open it again with **+** and it comes back already logged in.
- **Separate window** for any session.
- **Lives**: opens the livestreams that grant bonuses, each in a muted tab, at minimum quality by default (to use less memory) and without opening ads in your browser.
- **Language**: Português or English, from the menu (☰ button).
- **F1 to F12 shortcuts** that work anywhere in the app, including the bar and the Lives window.
- Runs locally, with no telemetry.

## How to install (Windows 10/11)

1. Open this project's **[Releases](../../releases/latest)** page.
2. Under **Assets**, download **`PokeMulti-Setup-….exe`**.
3. Double-click the downloaded file and follow the wizard (Next → Install). It creates a desktop shortcut.

You don't need to install anything else.

### Windows SmartScreen warning
Because the installer is not digitally signed, Windows may show **"Windows protected your PC"**. That warning alone does not tell you whether a file is safe or malicious. Download the installer **only** from this repository's Releases page and, if you like, check the SHA-256 hash (see below). If you trust the source and accept the risks, click **More info → Run anyway**.

## First use

1. Open **PokeMulti** from the shortcut. It starts with **2 sessions** side by side.
2. **Log in once in each pane.** The login is saved.
3. Press **F12** at any time to see the shortcuts. The **☰** button in the bottom bar opens the menu with **Idioma / Language** and the Lives options.

### What you can do

| I want to... | How |
|---|---|
| See just one session | Click its tab in the bottom bar, or `F1` to `F4` (again = back to grid) |
| Go back to the grid | **Grid** button or `F5` |
| Create a session | **+** button or `F6` (maximum of 4) |
| Close a session | The tab's **✕** button, `F7`, or right-click → **Close session** |
| Rename a session | Double-click its tab, or right-click → **Rename…** |
| Mute a session | The tab's 🔊 / 🔇 button |
| Zoom (50% to 200%) | The − and + buttons in the bar (click the value to return to 100%) |
| Open in its own window | The ⧉ button, `Shift+F1` to `Shift+F4`, or right-click |
| Switch between 2 and 4 sessions | `F8` or the **Sessions** menu |
| Reload | `Ctrl+R` (↻ button in the bar). `Ctrl+Shift+R` reloads all without cache |
| Open the bonus livestreams | **Lives** button or `F9` |
| Full screen | `F11` |
| See the shortcuts | `F12` |

### About Lives
The **Lives** button opens a window with the streams that grant XP bonuses, each in a **muted** tab. The first time, log in to Twitch (and Kick, if you use it) inside that window, with the same account linked to the game. The login is saved.

- **Quality and memory:** in the ☰ menu → **View**, pick the **Live quality** (minimum, 160p, is the default) and the **Twitch live limit** (default: 6). Each live is a video player, so this is what weighs the most.
- **Login:** the window presents itself as a regular Chrome. Email-and-password login should work; Google/Apple/Facebook login opens extra windows that the app blocks, so it may not work.
- **Ads:** popups and redirects from the livestream pages are blocked (they no longer open tabs in your browser), and a few tracking domains are cancelled. Twitch's own video ads are not blocked.

## Security and privacy

Behavior confirmed in the code:

- Each session uses its own browser partition, stored on your computer, so cookies and logins don't mix.
- The app only loads the game's site and the livestream pages (Twitch and Kick). Links to other addresses open in your default browser.
- No telemetry and no automatic update check: the app does not send your data to third parties.
- Camera, microphone, location, and notifications are denied.
- Closing a session **does not delete** its data. To delete it, use **Reset session data**.
- The code is public, but that is not a guarantee of safety: check it yourself if you wish.

**Can I get banned?** Use it in line with the [PokeIdle terms](https://pokeidle.io/terms). The app does not bypass game rules, but you are responsible for how you use it, and the project's publisher is not responsible for penalties applied by the game.

**Is it heavy?** Every session and every live is a tab of the built-in browser, so memory use grows with their number. If your PC struggles, use 2 sessions and close the Lives window when you don't need it.

**Does it cost anything?** No. The project is free and open source. It opens the game with the **author's referral code** (shown under ☰ → **Help → About**), which is how the author can receive in-game diamonds.

## Support the project

If you don't have a PokeIdle account yet and want to help the author, create yours through the referral link: **[pokeidle.io/?ref=656DPSE](https://pokeidle.io/?ref=656DPSE)**. It's optional, changes nothing for you, and the author receives in-game diamonds. The app already opens the game with this code.

## Troubleshooting

- **A session is blank or stuck:** the ↻ button, `F5`, or `Ctrl+F5` (ignores the cache) if needed.
- **It asks for login again:** use **Reset session data** only if something is wrong, because it deletes the login.
- **Lives don't show up:** wait a few seconds after opening the sessions and make sure you are logged in to the game.
- **Twitch says the browser is not supported:** reopen the Lives window and use email-and-password login. If it persists, open an issue with the exact message.
- **Windows blocked the installer:** see the SmartScreen notice above.

## Reporting problems

Open an [issue](../../issues) with the app version (☰ → **Help → About**), what you did, and what happened. **Do not post** passwords, tokens, cookies, e-mails, or screenshots showing account data.

## Verify the file (optional)

Each release includes a `SHA256SUMS.txt`. In PowerShell, from the download folder:

```
Get-FileHash .\PokeMulti-Setup-<version>.exe -Algorithm SHA256
```

The result should match the one in the file. This confirms the file is the one that was published, not that it is safe.

---

## For developers

Requires Node.js 22.12 or newer.

```
npm install
npm start          # run straight from source
npm test           # syntax check + tests
npm run dist       # builds dist/PokeMulti-Setup-<version>.exe
```

Without Node on your machine: push the project to GitHub and run **Actions → Build e Release**, or create a tag. **The tag must match the `version` in `package.json`** (for example, version `1.1.0` → tag `v1.1.0`), because the installer's name comes from `package.json`.

- Referral link: the `GAME_URL` constant in `src/config.js`. Replace it with yours if you make your own version.
- Domains allowed for navigation: `GAME_HOSTS` and `LIVE_HOSTS` in `src/config.js`.
- Interface text: `src/i18n.js` (Portuguese and English) and `ui/help.*.html`.
- Shortcuts: all in `src/shortcuts.js`. To change a key, edit only that file.
- Tracking domains blocked in Lives: `LIVE_BLOCKED_HOSTS` in `src/config.js`.

## License
[MIT](LICENSE)
