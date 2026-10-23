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
- **Lives**: opens the livestreams that grant bonuses in your Windows default browser, all together in a new window. If you prefer, they can also open inside the app, in muted tabs.
- **Language**: Português or English, from the menu (☰ button).
- **Updates from the app itself**: it tells you when a new version is out and installs it with one click, without going back to GitHub.
- **"All" button**: applies zoom, sound and reload to all sessions at once.
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
| Zoom, sound and reload on all at once | Turn on the **All** button in the bottom bar, or use the **Sessions** menu |
| Open in its own window | The ⧉ button, `Shift+F1` to `Shift+F4`, or right-click |
| Switch between 2 and 4 sessions | `F8` or the **Sessions** menu |
| Reload | `Ctrl+R` (↻ button in the bar). `Ctrl+Shift+R` reloads all without cache |
| Open the bonus livestreams | **Lives** button or `F9` |
| Full screen | `F11` |
| See the shortcuts | `F12` |

### About Lives
The **Lives** button (or `F9`) opens the streams that grant XP bonuses **in your Windows default browser**, all together in a **new window**, one tab per stream. Since it's your own browser, you use the Twitch and Kick login you already have, with no "unsupported browser" problem.

- **New lives:** when a new stream goes live, the app shows a notification and the button gets a red dot. Pressing `F9` again opens only the ones not opened yet. To open all of them again: ☰ → **View** → **Reopen all lives in the browser**.
- **Sound:** the app **cannot mute** tabs in your browser. Mute them yourself: in Chrome and Edge, right-click the tab and choose **Mute site**, and the browser remembers it for Twitch; in Firefox, click the tab's sound icon.
- **Quality:** it's the one set in Twitch's player in your browser. Pick a low quality (for example 160p) once, and it usually remembers. This is what reduces memory and bandwidth the most.
- **Limit:** ☰ → **View** → **Twitch live limit** (default: 6).
- **"Inside the app" mode:** under ☰ → **View** → **Open lives in**, you can go back to opening the streams in a window of the app itself, with muted tabs and minimum quality by default (**Live quality** menu). In that mode Twitch and Kick login happens inside the window, and Google/Apple/Facebook login may not work. Ad popups and redirects are blocked, and a few tracking domains are cancelled. Twitch's own video ads are not blocked.

## Security and privacy

Behavior confirmed in the code:

- Each session uses its own browser partition, stored on your computer, so cookies and logins don't mix.
- The app only loads the game's site (and, in "Inside the app" mode, the Twitch and Kick livestream pages). Links to other addresses open in your default browser. By default, lives open straight in your browser.
- No telemetry: the app does not send your data to third parties.
- **Updates:** the app checks this project's Releases page on GitHub to see if there is a new version. You can turn this off under ☰ → **Help** → **Check for updates on startup**. Nothing is downloaded or installed without your confirmation, and the package is verified against the hash published in the Release. Since the installer is not digitally signed, the safety of updates depends on the author's GitHub account.
- Camera, microphone, location, and notifications are denied.
- Closing a session **does not delete** its data. To delete it, use **Reset session data**.
- The code is public, but that is not a guarantee of safety: check it yourself if you wish.

**Can I get banned?** Use it in line with the [PokeIdle terms](https://pokeidle.io/terms). The app does not bypass game rules, but you are responsible for how you use it, and the project's publisher is not responsible for penalties applied by the game.

**Is it heavy?** Every session is a tab of the built-in browser, so memory use grows with their number. Lives opened in your browser also use memory there: use a low quality and the live limit. If your PC struggles, use 2 sessions.

**Does it cost anything?** No. The project is free and open source. It opens the game with the **author's referral code** (shown under ☰ → **Help → About**), which is how the author can receive in-game diamonds.

## Support the project

If you don't have a PokeIdle account yet and want to help the author, create yours through the referral link: **[pokeidle.io/?ref=656DPSE](https://pokeidle.io/?ref=656DPSE)**. It's optional, changes nothing for you, and the author receives in-game diamonds. The app already opens the game with this code.

## Troubleshooting

- **A session is blank or stuck:** the ↻ button, `F5`, or `Ctrl+F5` (ignores the cache) if needed.
- **It asks for login again:** use **Reset session data** only if something is wrong, because it deletes the login.
- **Lives don't show up:** wait a few seconds after opening the sessions and make sure you are logged in to the game.
- **The lives opened in an existing browser window:** the app tries to open a new window with Chrome, Edge, Brave, Opera, Vivaldi and Firefox. With another browser, it opens one tab at a time in the default browser.
- **It opened with sound:** the app doesn't control your browser's sound. See the muting tip under **About Lives**.
- **The update doesn't show up:** use ☰ → **Help** → **Check for updates…**. If you have a version **older than 1.3.0**, you need to download the installer manually once; after that, updates come through the app.
- **In the "Inside the app" window Twitch says the browser is not supported:** use email-and-password login or go back to "Default browser" mode.
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

Without Node on your machine: push the project to GitHub and run **Actions → Build e Release**, or create a tag. The Release must contain `latest.yml` and the `.blockmap` files (the workflow already publishes them); without them the app can't update itself. **The tag must match the `version` in `package.json`** (for example, version `1.1.0` → tag `v1.1.0`), because the installer's name comes from `package.json`.

- Referral link: the `GAME_URL` constant in `src/config.js`. Replace it with yours if you make your own version.
- Domains allowed for navigation: `GAME_HOSTS` and `LIVE_HOSTS` in `src/config.js`.
- Interface text: `src/i18n.js` (Portuguese and English) and `ui/help.*.html`.
- Shortcuts: all in `src/shortcuts.js`. To change a key, edit only that file.
- Tracking domains blocked in Lives: `LIVE_BLOCKED_HOSTS` in `src/config.js`.

## License
[MIT](LICENSE)
