# PokeMulti

[Português](README.md) · **English**

Play **several [PokeIdle](https://pokeidle.io) accounts at the same time, in a single window**. Each account has its own login and its own data, with nothing shared between them.

> Unofficial fan project. Not affiliated with PokeIdle, Nintendo, Game Freak, Creatures, or The Pokémon Company.

<!-- Add screenshots here: ![Account grid](docs/grid.png) ![Lives](docs/lives.png) -->

## How to install (Windows 10/11)

1. Open the project's **[Releases](../../releases/latest)** page.
2. Under **Assets**, click **`PokeMulti-Setup-….exe`** to download it.
3. Double-click the downloaded file.
4. If you see **"Windows protected your PC"**: click **More info**, then **Run anyway**. This happens because the program has no digital signature (signing certificates are paid), not because it is dangerous. The full source code is public here for anyone to check.
5. Follow the wizard (Next → Install). It creates a desktop shortcut.

You don't need to install anything else.

## First use

1. Open **PokeMulti** from the shortcut. It starts with **2 accounts** side by side.
2. **Log in once in each pane.** The login is saved, so next time you go straight in.
3. Press **F1** at any time to see all the shortcuts.

### What you can do

| I want to... | How |
|---|---|
| View one account full screen | `Ctrl+1` to `Ctrl+4` (press again to return to the grid) |
| Go back to the grid | `Ctrl+0` or the **Grade** button |
| Switch between 2 and 4 accounts | `Ctrl+Shift+0` or the **Contas** button |
| Open an account in its own window | `Ctrl+Alt+1` to `Ctrl+Alt+4` or the ⧉ buttons |
| Open the bonus livestreams | `Ctrl+T` or the **Lives** button |
| Reload the current account | `F5` |
| Toggle full screen | `F11` |

### About Lives
The **Lives** button opens a window with the streams that grant XP bonuses, each in a **muted** tab. The first time, log in to Twitch (and Kick, if you use it) inside that window, with the same account linked to the game. The login is saved.

> The app interface is currently in Portuguese.

## Quick questions

**Is it safe?** The program only opens the game's official website. It collects no data, has no telemetry, and sends nothing to third parties. Each account is isolated from the others.

**Can I get banned?** Use it in line with the [PokeIdle terms](https://pokeidle.io/terms). The app does not bypass any game rule, but you are responsible for how you use it. The project's publisher is not responsible for penalties applied by the game.

**Is it heavy?** Every account and every live is a tab of the built-in browser, so memory use grows with their number. If your PC struggles, use 2 accounts and close the Lives window when you don't need it.

**Does it cost anything?** No. The project is free and open source. It opens the game with the author's referral code, which is how the author can receive in-game diamonds.

## Verify the file (optional)

Each release includes a `SHA256SUMS.txt`. In PowerShell, from the download folder:

```
Get-FileHash .\PokeMulti-Setup-<version>.exe -Algorithm SHA256
```

The result should match the one in the file.

---

## For developers

Requires Node.js 22.12 or newer.

```
npm install
npm start          # run straight from source
npm test           # syntax check + tests
npm run dist       # builds dist/PokeMulti-Setup-<version>.exe
```

Without Node on your machine: push the project to GitHub and run **Actions → Build e Release**, or create a `v*` tag (`git tag v1.0.1 && git push origin v1.0.1`). The installer and `SHA256SUMS.txt` are published under Releases.

- Referral link: the `GAME_URL` constant in `src/config.js`. Replace it with yours if you make your own version.
- Domains allowed for navigation: `GAME_HOSTS` and `LIVE_HOSTS` in `src/config.js`.
- Twitch live limit (to use less memory): `{ "maxTwitch": 4 }` in `config.json`, in the app data folder (`%APPDATA%\pokemulti-local`).

### Security
- Sandbox and `contextIsolation` on every view; none uses `nodeIntegration`.
- Permissions (camera, microphone, location, notifications) denied.
- Navigation restricted to a list of domains; everything else opens in the default browser.
- Data coming from the game page is validated (`src/lives-parse.js`, with tests).
- No local extensions, no update checks, no telemetry.
- Electron fuses and on-disk cookie encryption enabled in the build.

### Credits
The idea and the format of the game's livestream messages were observed in the MIT project
[robertcristianoo/multi-pokeidle-io](https://github.com/robertcristianoo/multi-pokeidle-io). The code here is a rewrite.

## License
MIT
