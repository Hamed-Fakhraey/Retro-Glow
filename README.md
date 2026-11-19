# RetroGlow

RetroGlow is a Persian-language clock, countdown timer, and alarm. It runs in the browser and as a Windows desktop app.

Use Node.js 22.12 or newer. Install dependencies with `npm ci`, then choose a development command:

| Command | What it runs |
| --- | --- |
| `npm run dev` | Starts Vite and opens Electron. You can also open the Vite URL in your browser. |
| `npm run dev:web` | Starts only Vite at `http://127.0.0.1:5173/`. |
| `npm run dev:electron` | Opens Electron after a separately started Vite server is ready. |

Use `npm run build` to build the web app into `dist/`. Use `npm run lint` to check the web and Electron code.

To produce the Windows x64 installer, run `npm run dist:win` on Windows. The installer is written to `release/` as `RetroGlow Setup <version>.exe`. It installs for the current user, lets you choose the installation folder, and creates desktop and Start menu shortcuts. The installed app loads the bundled web build and uses the Start menu shortcut for Windows notification registration.

Closing the desktop window sends RetroGlow to the system tray. Use **نمایش RetroGlow** to bring it back or **خروج کامل** to quit. Alarms and countdowns can sound while RetroGlow is in the tray, and an alert that fires there shows the window and posts a Windows notification. Alerts cannot fire while RetroGlow is fully quit. If you enable **اجرا در هنگام روشن شدن ویندوز** in the installed app, RetroGlow starts in the tray when you sign in to Windows. This setting is off by default.

To check the installed app on Windows, enable an alarm for the next minute and close the window. Check that it sounds, the taskbar button flashes, and clicking the notification focuses the window. Launch RetroGlow again to check that it focuses the existing instance. Then choose **خروج کامل** and verify the tray icon disappears.
