const { app, BrowserWindow, ipcMain, Menu, Notification, Tray } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const appId = 'com.retroglow.app'
const icon = path.join(__dirname, 'icon.png')
const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
const devUrl = !app.isPackaged && process.argv.includes('--vite-dev') ? 'http://127.0.0.1:5173/' : null
const rendererUrl = devUrl ?? pathToFileURL(indexPath).href
const supportsStartup = process.platform === 'win32' && app.isPackaged
const loginItem = { args: ['--startup'] }

let win
let tray
let notification
let quitting = false

function showWindow() {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 720,
    minHeight: 560,
    title: 'RetroGlow',
    backgroundColor: '#090916',
    icon,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  })

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (event) => event.preventDefault())
  win.webContents.on('will-redirect', (event) => event.preventDefault())
  win.once('ready-to-show', () => {
    if (!supportsStartup || !process.argv.includes('--startup')) showWindow()
  })
  win.on('focus', () => win.flashFrame(false))
  win.on('close', (event) => {
    if (quitting) return
    event.preventDefault()
    win.hide()
  })
  win.on('closed', () => { win = undefined })

  const load = devUrl ? win.loadURL(devUrl) : win.loadFile(indexPath)
  load.catch((error) => {
    if (quitting) return
    console.error('Could not load RetroGlow:', error)
    app.quit()
  })
}

function getLaunchAtStartup() {
  if (!supportsStartup) return null
  const settings = app.getLoginItemSettings(loginItem)
  return settings.openAtLogin && settings.executableWillLaunchAtLogin
}

function handle(channel, callback) {
  ipcMain.handle(`retroglow:${channel}`, (event, value) => {
    if (!win || event.sender !== win.webContents ||
        event.senderFrame !== event.sender.mainFrame || event.senderFrame?.url !== rendererUrl) {
      throw new Error('Unexpected RetroGlow IPC sender')
    }
    return callback(value)
  })
}

function alertFired(kind) {
  const body = kind === 'alarm' ? 'زنگ هشدار!' : kind === 'timer' ? 'شمارش معکوس به پایان رسید!' : null
  if (!body || (win.isVisible() && !win.isMinimized())) return

  if (win.isMinimized()) win.restore()
  win.showInactive()
  win.flashFrame(true)

  if (Notification.isSupported()) {
    notification?.close()
    notification = new Notification({ title: 'RetroGlow', body, icon, silent: true })
    notification.on('click', showWindow)
    notification.show()
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  if (process.platform === 'win32') app.setAppUserModelId(appId)
  app.on('second-instance', showWindow)
  app.on('activate', showWindow)
  app.on('before-quit', () => { quitting = true })
  app.on('window-all-closed', () => app.quit())

  app.whenReady().then(() => {
    handle('show-window', showWindow)
    handle('quit', () => app.quit())
    handle('get-launch-at-startup', getLaunchAtStartup)
    handle('set-launch-at-startup', (enabled) => {
      if (typeof enabled !== 'boolean') throw new TypeError('Expected a boolean startup setting')
      if (!supportsStartup) return null
      app.setLoginItemSettings({ ...loginItem, openAtLogin: enabled })
      return getLaunchAtStartup()
    })
    handle('alert-fired', alertFired)

    tray = new Tray(icon)
    tray.setToolTip('RetroGlow')
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'نمایش RetroGlow', click: showWindow },
      { label: 'خروج کامل', click: () => app.quit() },
    ]))
    tray.on('double-click', showWindow)
    createWindow()
  }).catch((error) => {
    console.error('Could not start RetroGlow:', error)
    app.quit()
  })
}
