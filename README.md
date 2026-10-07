# Jigyasa / Mars

Jigyasa is a local web app for exploring NASA's Curiosity photographs and driving a 3D rover across measured Mars terrain. It includes a photo archive, private saved-photo notebooks, rotating Mars and Curiosity models, weather scenarios, and a terrain survey map.

**This README takes you from a new computer to a running app.** The working version is in `next/`. Start with Node.js 24 and a modern browser. Git is optional if you download a ZIP or transfer the project by USB.

[Repository](https://github.com/akshaycg46/Mars) · [Commit history](https://github.com/akshaycg46/Mars/commits/main/) · [Simulation data and limits](docs/SIMULATION.md)

## Setup guide

1. [Install the software](#1-install-the-software).
2. [Get the project](#2-get-the-project).
3. [Restore your notebooks if transferring computers](#3-transfer-existing-accounts-and-notebooks-optional).
4. [Start Jigyasa](#4-start-jigyasa).
5. [Check it works](#5-check-your-installation).

[Troubleshooting](#troubleshooting) · [Backups](#back-up-the-project) · [Updating](#update-the-project) · [Technology](#technology)

## 1. Install the software

| Software | Required? | Installation link and purpose |
| --- | --- | --- |
| Node.js 24 LTS | Yes | [Official Node.js download](https://nodejs.org/en/download). Runs the web server and includes the SQLite support used by this project. Select the latest available **24.x LTS** release. |
| A modern browser | Yes; an existing updated browser is fine | [Google Chrome](https://www.google.com/chrome/) or [Mozilla Firefox](https://www.mozilla.org/firefox/new/). If you already have an updated browser, check it using step 5 before installing another. The simulator needs WebGL 2 and WebAssembly. |
| Git | Only for cloning, pulling updates or keeping Git history | [Official Git installation guide](https://git-scm.com/install/) with Windows, macOS and Linux instructions. |

### Install Node.js

1. Open the [Node.js download page](https://nodejs.org/en/download).
2. Select **Node.js 24 LTS**, your operating system, and the architecture matching your computer. Apple Silicon Macs use ARM64; many Windows and Linux laptops use x64. Check your computer's system information if unsure.
3. On Windows, use the `.msi` installer. On macOS, use the `.pkg` installer. On Linux, follow the Linux installation option on the official page. Ensure the installed version is 24.x rather than an older distribution package.
4. Keep the installer's standard settings, including adding Node.js to PATH when offered.
5. Close and reopen your terminal, then run:

```sh
node --version
```

You should see `v24.` followed by the remaining version numbers. The project declares Node.js 24 or newer; 24 LTS is the documented setup baseline. This guide's commands were checked using Node.js 24.19.0 on Windows. macOS and Linux commands are provided, but those platforms have not been independently verified for this project.

If using Git, install it from the [official guide](https://git-scm.com/install/), reopen the terminal, and check:

```sh
git --version
```

**No `npm install` step is needed.** The current app uses Node's built-in modules, and its browser libraries, rover models and terrain files are already in the repository. Running it does not require Java, Eclipse, Tomcat, MySQL, Python, a separate SQLite installation, a NASA API key, or Codex. The original Java project is preserved in `src/` for reference.

## 2. Get the project

Choose **one** of these methods. Keep the project in a writable local folder on the new computer, such as Documents. If a folder is synced through OneDrive, wait until all files are fully downloaded before starting.

### Option A: Clone from GitHub

Open PowerShell / Windows Terminal on Windows, or Terminal on macOS / Linux. Navigate to the parent folder where you want to keep the project, then run:

```sh
git clone https://github.com/akshaycg46/Mars.git
cd Mars
```

The repository is public, so downloading it does not require signing into GitHub. A clone includes the source and Git history. It does **not** include accounts or notebooks from your old computer; restore those in step 3 if needed.

### Option B: Download a ZIP without Git

1. [Download the latest project ZIP](https://github.com/akshaycg46/Mars/archive/refs/heads/main.zip), or visit the [repository](https://github.com/akshaycg46/Mars) and select **Code → Download ZIP**.
2. Extract the ZIP completely. On Windows, right-click it and choose **Extract All**.
3. Open the extracted `Mars-main` folder. This is the repository folder for the remaining instructions.

A ZIP contains the source and bundled assets, but no Git history or private notebook database. [GitHub's source archive instructions](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) explain this download method.

### Option C: Copy your existing project using USB

1. On the old computer, stop the app with **Ctrl+C** in its server terminal.
2. Copy the entire `Jigyasa` folder to the USB, including `Mars`, its hidden `.git` folder if present, and `Mars/next/.data` if present.
3. On the new computer, copy the folder from the USB to local storage. Keep the original and USB copies until you have verified the new installation.
4. Open the transferred `Jigyasa/Mars` folder. This is the repository folder for the remaining instructions.

Enable **View → Show → Hidden items** in Windows File Explorer if needed. On macOS, **Command+Shift+Period** toggles hidden files in Finder. If you copied the complete folder including `.data`, your local notebook database is already transferred; continue to step 4.

### Confirm the folder structure

Whichever method you chose, the repository folder should contain:

```text
Mars/                         # ZIP downloads may call this Mars-main
├── README.md
├── Start-Jigyasa.ps1          # Optional Windows launcher
├── docs/                     # Data sources and technical notes
├── scripts/                  # Optional terrain preparation tools
├── src/                      # Original Java implementation
└── next/                     # Current app
    ├── server.mjs
    ├── package.json
    ├── public/
    │   ├── models/           # NASA 3D rover and Mars assets
    │   ├── terrain/          # Measured elevations and orbital images
    │   ├── vendor/           # Bundled browser libraries
    │   └── sim/              # Simulator code
    ├── test/
    └── .data/                # Local data; created on first run or restored
```

## 3. Transfer existing accounts and notebooks (optional)

**GitHub does not back up local accounts, saved photos or observation notes.** These are stored in `next/.data/jigyasa.sqlite`. The `.data` directory is deliberately excluded from Git.

If you downloaded a fresh clone or ZIP and want your existing notebooks:

1. Stop Jigyasa on **both** computers before copying database files.
2. On the old computer, copy the **whole `Mars/next/.data` directory**, including any `jigyasa.sqlite-wal` or `jigyasa.sqlite-shm` files that remain. This preserves a consistent set of database files.
3. Before the first run on the new computer, paste that directory inside the new repository's `next` folder. The resulting database path must be `Mars/next/.data/jigyasa.sqlite`, not `.data/.data/jigyasa.sqlite`.
4. If you already created a `.data` directory on the new computer, make a separate backup of it first. Restore the old directory as a complete replacement while the server is stopped; do not merge databases from different installations.
5. Start the app and sign in with your existing email and password. Browser sign-in cookies are separate, so signing in again may be necessary.

Keep `.data` private: it contains account records, password hashes, sessions and notebook notes. Do not upload it to the public repository. The notebook stores image links and metadata; browsing those NASA images still requires internet access. Existing accounts from the original Java/MySQL app are not automatically migrated to this version.

## 4. Start Jigyasa

### Windows

1. Open the repository folder in File Explorer (`Mars`, `Mars-main`, or the transferred `Jigyasa/Mars`).
2. Open its `next` folder. You should see `server.mjs`.
3. Click File Explorer's address bar, type `powershell`, and press Enter. This opens PowerShell in that folder.
4. Run:

```powershell
node server.mjs
```

If your terminal is already in the repository folder, run these instead:

```powershell
cd next
node server.mjs
```

The optional `./Start-Jigyasa.ps1` launcher also works from the repository folder when your PowerShell policy permits it. If Windows blocks scripts, use `node server.mjs` from `next`; changing execution policy is unnecessary.

### macOS or Linux

In Terminal, navigate to your repository folder. If you have just completed the clone commands above, you are already there. Run:

```sh
cd next
node server.mjs
```

For a ZIP or USB copy, use `cd` with the actual extracted/transferred path first. Put a path in quotes if it contains spaces, for example `cd "/your/project/location/Mars"` (replace that example with your real path).

### Open the app

The terminal should print:

```text
Jigyasa is ready at http://127.0.0.1:4173
```

Keep that terminal running, then open:

- [Jigyasa home and NASA archive](http://127.0.0.1:4173)
- [Mars rover simulator](http://127.0.0.1:4173/drive)

These links work on the computer running the server. `127.0.0.1` points to that computer; this setup does not publish the app online. Start the server each time you want to use Jigyasa. Stop it with **Ctrl+C** in its terminal.

## 5. Check your installation

1. Open the home page and confirm Mars renders in 3D.
2. Search the NASA photo archive for **April 14, 2020** and check that real thumbnails load. NASA must be reachable for this check; the exact archive count can change.
3. Open `/drive`, press **Start driving**, click the landscape and hold **W**. Use **A/D** while moving to steer, **S** to reverse and **Space** to brake. The **How to drive ?** guide also covers touch controls, camera movement and map waypoints.
4. Confirm the terrain, rover, weather selector and survey map load. Explore is the default assisted pace; Rover pace is slower.
5. If you restored a notebook, sign in and confirm your saved entries appear. Otherwise, create a local account if you want to save photos.

You can also run the automated checks. From `next`, use a second terminal or stop the server first:

```sh
node --test test/*.test.mjs
```

The test runner should report zero failures. Automated tests use temporary databases and mocked NASA responses, so they do not prove that NASA is reachable from your network. The simulator tests check terrain integrity, gravity, driving, braking and navigation calculations.

Setup verification on October 7, 2026: a fresh local Git clone ran all 16 tests successfully without installing packages. Its server served the home page, simulator, NASA rover model and rugged terrain asset successfully. This verification was performed on Windows with Node.js 24.19.0.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` is not recognized / command not found | Install Node.js 24 LTS, close and reopen the terminal, and run `node --version`. If necessary, reinstall with Node added to PATH. |
| `ERR_UNKNOWN_BUILTIN_MODULE`, missing `node:sqlite`, or SQLite API errors | Check `node --version` and install the latest Node.js 24.x LTS release. An older Node installation may be taking precedence on PATH. |
| Cannot find `server.mjs` | Open the **`next` folder** before running `node server.mjs`. Extract the ZIP first; do not run from the archive viewer. |
| `EADDRINUSE` / port 4173 already in use | An existing Jigyasa process may already be running. Open its URL, stop the previous process with Ctrl+C, or use the alternate-port commands below. |
| Browser says it cannot connect | Start the server, keep its terminal open, check for terminal errors, and open the exact URL printed. Opening `index.html` directly does not start the app. |
| NASA archive connection fails | Check internet access, retry, and ensure the Node process can make outbound HTTPS requests to `mars.nasa.gov`. Restricted development runners may block networking. No API key is required. [Archive recovery details](docs/ARCHIVE-CONNECTIVITY.md). |
| Gallery metadata loads but images fail | The browser also needs access to NASA image hosts, including `mars.nasa.gov` and `mars.jpl.nasa.gov`. Check network restrictions or browser extensions. |
| Simulator cannot start or the 3D view is blank | Update the browser, enable its graphics/hardware acceleration if available, and update the computer's graphics drivers. WebGL 2 and WebAssembly are needed. Check that `next/public/models`, `terrain` and `vendor` were copied completely. |
| Simulator runs slowly | Use the 1× simulation clock, close other graphics-heavy tabs, and try another updated browser. Device graphics capability affects performance. |
| Saved notebooks are missing | A GitHub clone/ZIP starts with fresh local data. Restore the old `next/.data` directory while both servers are stopped, and sign in to the same account. |
| Windows blocks `Start-Jigyasa.ps1` or `npm.ps1` | Start with `node server.mjs` and run tests with `node --test test/*.test.mjs`; these instructions do not require PowerShell scripts or npm. |
| Permission or read-only database error | Copy the project from the USB into a writable local folder. Check that its `.data` folder is writable and that OneDrive has fully downloaded all files. |
| A SQLite experimental warning appears | Some Node.js 24 releases print a SQLite warning. If the server prints its ready message and works, the warning alone does not indicate a failed start. |

### Use another port

Run from `next`. On Windows PowerShell:

```powershell
$env:PORT = '4174'
node server.mjs
```

On macOS / Linux:

```sh
PORT=4174 node server.mjs
```

Then open [http://127.0.0.1:4174](http://127.0.0.1:4174) or [the simulator on port 4174](http://127.0.0.1:4174/drive). In PowerShell, the port setting lasts for that terminal session; close it or set `$env:PORT = '4173'` to return to the default.

## Back up the project

1. Stop the server with Ctrl+C before copying its database.
2. Copy the entire repository folder to your backup destination. Include `.git` if you want local Git history and **`next/.data`** to preserve accounts and notebooks.
3. When moving the wider original workspace, copy the entire `Jigyasa` folder so supporting files outside `Mars` are included too.
4. Verify the copy contains `next/server.mjs`, `next/public/models`, `next/public/terrain` and the `.data` database if you use notebooks.
5. Keep the original copy until the restored app has been tested. Safely eject a USB drive before unplugging it.

GitHub preserves committed source and bundled assets. It does not preserve your uncommitted changes, private `.data` directory or files outside the repository. Notebook data stays in the local SQLite database when the server stops.

## Update the project

For a Git clone, stop the server, back up your local work and `.data`, then run from the repository folder:

```sh
git status
git pull --ff-only origin main
cd next
node server.mjs
```

If Git reports local changes or refuses the pull, preserve your work and resolve that condition before updating. Avoid discarding changes just to make a pull succeed. Git leaves the ignored `.data` directory outside normal source updates.

For a ZIP download, extract the new version into a **separate folder**, restore your backed-up `.data` while the app is stopped, then start and verify the new copy. Keep the old copy until it works.

## Technology

| Layer | Technology |
| --- | --- |
| Server | Node.js 24, built-in HTTP server |
| Database | SQLite through `node:sqlite` |
| Interface | HTML, CSS, browser JavaScript modules |
| Planet and rover viewer | Locally bundled Google model-viewer 4.3.1 and NASA GLB assets |
| Driving simulation | Three.js 0.186.1, Rapier 0.21.0 / WebAssembly, HiRISE elevation data |
| Authentication | scrypt password hashes and HttpOnly session cookies |
| Imagery | NASA / JPL Curiosity raw image gallery endpoint |
| Tests | Node.js test runner |

The simulator uses measured terrain with illustrative color/detail and simplified vehicle physics. Explore mode deliberately increases speed and motor assistance. Weather is simulated rather than live. [Sources, controls and limitations](docs/SIMULATION.md) are documented separately.

## Optional development tools

These are only needed if you want to edit or regenerate parts of the project:

- [Visual Studio Code](https://code.visualstudio.com/Download) or another editor for source changes.
- [Python](https://www.python.org/downloads/), [NumPy installation instructions](https://numpy.org/install/) and [Pillow installation instructions](https://pillow.readthedocs.io/en/stable/installation/basic-installation.html) for rerunning terrain preparation scripts. Pillow needs JPEG 2000 support for the orbital image source. Existing terrain assets are already included; see [the reproduction steps](docs/SIMULATION.md#surface-appearance) before downloading the larger source datasets.

## Project notes

- [App implementation and verification](next/README.md)
- [Terrain, weather and physics documentation](docs/SIMULATION.md)
- [NASA archive connectivity](docs/ARCHIVE-CONNECTIVITY.md)
- [Asset credits and licenses](next/public/ASSET-CREDITS.md)
- [Rebuild requirements](docs/REBUILD.md)

The original Java Servlets/JSP/MySQL implementation remains in `src/`. This setup guide runs the current redesign in `next/`; it does not configure the legacy Java app.

Jigyasa currently listens on loopback for local use. Public deployment requires additional hosting, HTTPS, secure-cookie and persistent-storage configuration; it is not part of this setup. Account email verification and password recovery are not implemented.

NASA/JPL-Caltech, NASA VTAD, University of Arizona, USGS and mission partners provide the referenced models, terrain and imagery. This is an independent project, not affiliated with or endorsed by NASA.
