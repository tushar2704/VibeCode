# ⚡ Electron Cross-Platform Desktop Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Build Desktop Apps with Web Technologies*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for Electron insights and best practices

---

## Overview

Electron enables building cross-platform desktop applications using web technologies. This guide covers **Electron development**, **main/renderer processes**, **native OS integration**, **security patterns**, and **Context Engineering** methodology for production-ready desktop applications.

## 🚀 Electron Project Setup

### Modern Electron Setup

```bash
# Create new Electron project
npm create electron-app@latest my-electron-app --template=typescript-webpack

# Or manual setup
npm init -y
npm install electron --save-dev
npm install @electron-forge/cli --save-dev

# Initialize Electron Forge
npx electron-forge init

# Development dependencies
npm install --save-dev @types/node typescript ts-loader webpack webpack-cli

# Production dependencies
npm install electron-updater electron-store electron-log
```

### Project Structure

```
my-electron-app/
├── src/
│   ├── main/                 # Main process
│   │   ├── main.ts
│   │   ├── menu.ts
│   │   ├── window-manager.ts
│   │   └── ipc-handlers.ts
│   ├── renderer/             # Renderer process
│   │   ├── index.html
│   │   ├── renderer.ts
│   │   ├── preload.ts
│   │   └── components/
│   ├── shared/               # Shared types and utilities
│   │   ├── types.ts
│   │   └── constants.ts
│   └── assets/               # Icons and resources
├── forge.config.ts           # Electron Forge configuration
├── webpack.config.js         # Webpack configuration
└── package.json
```

## 🏗️ Main Process Architecture

### Application Entry Point

```typescript
// src/main/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { WindowManager } from './window-manager'
import { setupMenu } from './menu'
import { registerIpcHandlers } from './ipc-handlers'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

class ElectronApp {
  private windowManager: WindowManager
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.windowManager = new WindowManager(this.isDev)
    
    // Configure logging
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    
    this.initializeApp()
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow()
      setupMenu()
      registerIpcHandlers()
      
      // Check for updates in production
      if (!this.isDev) {
        autoUpdater.checkForUpdatesAndNotify()
      }
    })

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Handle activate (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow()
      }
    })

    // Handle second instance (single instance lock)
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      app.on('second-instance', () => {
        const mainWindow = this.windowManager.getMainWindow()
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      })
    }

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.on('new-window', (navigationEvent, navigationURL) => {
        navigationEvent.preventDefault()
        // Open in external browser instead
        require('electron').shell.openExternal(navigationURL)
      })
    })
  }

  private createMainWindow(): void {
    this.windowManager.createMainWindow()
  }
}

// Initialize the application
new ElectronApp()
```

### Window Management

```typescript
// src/main/window-manager.ts
import { BrowserWindow, screen, app } from 'electron'
import * as path from 'path'
import Store from 'electron-store'

interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private store: Store<{ windowBounds: WindowBounds }>
  private isDev: boolean

  constructor(isDev: boolean) {
    this.isDev = isDev
    this.store = new Store({
      defaults: {
        windowBounds: { x: 0, y: 0, width: 1200, height: 800 }
      }
    })
  }

  createMainWindow(): BrowserWindow {
    const savedBounds = this.store.get('windowBounds')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    // Ensure window fits on screen
    const windowBounds = {
      x: Math.max(0, Math.min(savedBounds.x, width - savedBounds.width)),
      y: Math.max(0, Math.min(savedBounds.y, height - savedBounds.height)),
      width: Math.min(savedBounds.width, width),
      height: Math.min(savedBounds.height, height)
    }

    this.mainWindow = new BrowserWindow({
      ...windowBounds,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../renderer/preload.js'),
        webSecurity: !this.isDev
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false // Don't show until ready
    })

    // Load the application
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:3000')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // Show when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
      
      if (this.isDev) {
        this.mainWindow?.focus()
      }
    })

    // Save window bounds on close
    this.mainWindow.on('close', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const bounds = this.mainWindow.getBounds()
        this.store.set('windowBounds', bounds)
      }
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    return this.mainWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  createChildWindow(parentWindow: BrowserWindow, options: Partial<Electron.BrowserWindowConstructorOptions> = {}): BrowserWindow {
    const childWindow = new BrowserWindow({
      parent: parentWindow,
      modal: true,
      width: 600,
      height: 400,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      ...options
    })

    return childWindow
  }
}
```

## 🔐 Secure IPC Communication

### IPC Handlers (Main Process)

```typescript
// src/main/ipc-handlers.ts
import { ipcMain, dialog, shell, app, BrowserWindow } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import Store from 'electron-store'
import log from 'electron-log'

const store = new Store()

export function registerIpcHandlers(): void {
  // File operations
  ipcMain.handle('file:open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    return result
  })

  ipcMain.handle('file:save-dialog', async () => {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    })
    
    return result
  })

  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (error) {
      log.error('Error reading file:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      log.error('Error writing file:', error)
      return { success: false, error: error.message }
    }
  })

  // Store operations
  ipcMain.handle('store:get', (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('store:set', (_, key: string, value: any) => {
    store.set(key, value)
    return { success: true }
  })

  ipcMain.handle('store:delete', (_, key: string) => {
    store.delete(key)
    return { success: true }
  })

  // System operations
  ipcMain.handle('system:get-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node
    }
  })

  ipcMain.handle('system:open-external', async (_, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('system:show-item-in-folder', (_, fullPath: string) => {
    shell.showItemInFolder(fullPath)
  })

  // Window operations
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })

  // Notifications
  ipcMain.handle('notification:show', (_, title: string, body: string) => {
    const notification = new Notification({ title, body })
    notification.show()
  })

  // App operations
  ipcMain.handle('app:quit', () => {
    app.quit()
  })

  ipcMain.handle('app:restart', () => {
    app.relaunch()
    app.quit()
  })
}
```

### Preload Script (Security Bridge)

```typescript
// src/renderer/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// Define the API interface
interface ElectronAPI {
  // File operations
  file: {
    openDialog: () => Promise<Electron.OpenDialogReturnValue>
    saveDialog: () => Promise<Electron.SaveDialogReturnValue>
    read: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
    write: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  }
  
  // Store operations
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<{ success: boolean }>
    delete: (key: string) => Promise<{ success: boolean }>
  }
  
  // System operations
  system: {
    getInfo: () => Promise<{
      platform: string
      arch: string
      version: string
      electronVersion: string
      nodeVersion: string
    }>
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
    showItemInFolder: (fullPath: string) => void
  }
  
  // Window operations
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
  
  // Notifications
  notification: {
    show: (title: string, body: string) => void
  }
  
  // App operations
  app: {
    quit: () => void
    restart: () => void
  }
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  file: {
    openDialog: () => ipcRenderer.invoke('file:open-dialog'),
    saveDialog: () => ipcRenderer.invoke('file:save-dialog'),
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content)
  },
  
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key)
  },
  
  system: {
    getInfo: () => ipcRenderer.invoke('system:get-info'),
    openExternal: (url) => ipcRenderer.invoke('system:open-external', url),
    showItemInFolder: (fullPath) => ipcRenderer.invoke('system:show-item-in-folder', fullPath)
  },
  
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  
  notification: {
    show: (title, body) => ipcRenderer.invoke('notification:show', title, body)
  },
  
  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
    restart: () => ipcRenderer.invoke('app:restart')
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declarations for renderer
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

## 🎨 Renderer Process Development

### React Integration

```typescript
// src/renderer/components/TitleBar.tsx
import React from 'react'
import './TitleBar.css'

interface TitleBarProps {
  title?: string
}

export const TitleBar: React.FC<TitleBarProps> = ({ title = 'Electron App' }) => {
  const handleMinimize = () => {
    window.electronAPI.window.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI.window.maximize()
  }

  const handleClose = () => {
    window.electronAPI.window.close()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <div className="title-bar-title">{title}</div>
        <div className="title-bar-controls">
          <button 
            className="title-bar-button minimize" 
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            −
          </button>
          <button 
            className="title-bar-button maximize" 
            onClick={handleMaximize}
            aria-label="Maximize"
          >
            □
          </button>
          <button 
            className="title-bar-button close" 
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// src/renderer/hooks/useElectronStore.ts
import { useState, useEffect, useCallback } from 'react'

export function useElectronStore<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await window.electronAPI.store.get(key)
        if (stored !== undefined) {
          setValue(stored)
        }
      } catch (error) {
        console.error('Error loading from store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadValue()
  }, [key])

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setValue(newValue)
      await window.electronAPI.store.set(key, newValue)
    } catch (error) {
      console.error('Error saving to store:', error)
    }
  }, [key])

  const deleteValue = useCallback(async () => {
    try {
      setValue(defaultValue)
      await window.electronAPI.store.delete(key)
    } catch (error) {
      console.error('Error deleting from store:', error)
    }
  }, [key, defaultValue])

  return { value, updateValue, deleteValue, loading }
}

// src/renderer/components/FileManager.tsx
import React, { useState } from 'react'

export const FileManager: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const openFile = async () => {
    try {
      setLoading(true)
      const result = await window.electronAPI.file.openDialog()
      
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        const fileResult = await window.electronAPI.file.read(filePath)
        
        if (fileResult.success && fileResult.content) {
          setCurrentFile(filePath)
          setContent(fileResult.content)
        } else {
          alert(`Error reading file: ${fileResult.error}`)
        }
      }
    } catch (error) {
      console.error('Error opening file:', error)
      alert('Error opening file')
    } finally {
      setLoading(false)
    }
  }

  const saveFile = async () => {
    try {
      setLoading(true)
      
      if (currentFile) {
        // Save to existing file
        const result = await window.electronAPI.file.write(currentFile, content)
        if (result.success) {
          alert('File saved successfully!')
        } else {
          alert(`Error saving file: ${result.error}`)
        }
      } else {
        // Save as new file
        const result = await window.electronAPI.file.saveDialog()
        if (!result.canceled && result.filePath) {
          const writeResult = await window.electronAPI.file.write(result.filePath, content)
          if (writeResult.success) {
            setCurrentFile(result.filePath)
            alert('File saved successfully!')
          } else {
            alert(`Error saving file: ${writeResult.error}`)
          }
        }
      }
    } catch (error) {
      console.error('Error saving file:', error)
      alert('Error saving file')
    } finally {
      setLoading(false)
    }
  }

  const showInFolder = () => {
    if (currentFile) {
      window.electronAPI.system.showItemInFolder(currentFile)
    }
  }

  return (
    <div className="file-manager">
      <div className="toolbar">
        <button onClick={openFile} disabled={loading}>
          Open File
        </button>
        <button onClick={saveFile} disabled={loading}>
          {currentFile ? 'Save' : 'Save As'}
        </button>
        {currentFile && (
          <button onClick={showInFolder}>
            Show in Folder
          </button>
        )}
      </div>
      
      <div className="file-info">
        {currentFile ? (
          <span>Current file: {currentFile}</span>
        ) : (
          <span>No file opened</span>
        )}
      </div>
      
      <textarea
        className="editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="File content will appear here..."
        disabled={loading}
      />
    </div>
  )
}
```

## 📦 Build and Distribution

### Electron Forge Configuration

```typescript
// forge.config.ts
import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    name: 'My Electron App',
    executableName: 'my-electron-app',
    icon: './assets/icon',
    extraResource: ['./assets'],
    appBundleId: 'com.example.myelectronapp',
    appCategoryType: 'public.app-category.productivity',
    osxSign: {
      identity: 'Developer ID Application: Your Name (TEAM_ID)',
      'hardened-runtime': true,
      entitlements: 'assets/entitlements.plist',
      'entitlements-inherit': 'assets/entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID!,
      appleIdPassword: process.env.APPLE_ID_PASSWORD!,
      teamId: process.env.APPLE_TEAM_ID!
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'MyElectronApp',
      setupIcon: './assets/icon.ico'
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDMG({
      background: './assets/dmg-background.png',
      format: 'ULFO'
    }),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        maintainer: 'Your Name',
        homepage: 'https://example.com'
      }
    })
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/renderer/preload.ts'
            }
          }
        ]
      }
    })
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'your-username',
          name: 'your-repo'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
}

export default config
```

### Auto-Update Implementation

```typescript
// src/main/auto-updater.ts
import { autoUpdater } from 'electron-updater'
import { BrowserWindow, dialog } from 'electron'
import log from 'electron-log'

export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null

  constructor() {
    autoUpdater.logger = log
    this.setupEventListeners()
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  private setupEventListeners(): void {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...')
    })

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info)
      this.showUpdateAvailableDialog(info)
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info)
    })

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
      logMessage += ` - Downloaded ${progressObj.percent}%`
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`
      log.info(logMessage)
      
      // Send progress to renderer
      this.mainWindow?.webContents.send('download-progress', progressObj.percent)
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info)
      this.showUpdateDownloadedDialog()
    })
  }

  private async showUpdateAvailableDialog(info: any): Promise<void> {
    const result = await dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it now?`,
      detail: 'The update will be downloaded in the background.',
      buttons: ['Download', 'Later'],
      defaultId: 0
    })

    if (result.response === 0) {
      autoUpdater.downloadUpdate()
    }
  }

  private async showUpdateDownloadedDialog(): Promise<void> {
    const result = await dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully. Restart the application to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  }

  checkForUpdates(): void {
    autoUpdater.checkForUpdatesAndNotify()
  }
}
```

## 🔧 Context Engineering for Electron

### System Context Template

```markdown
# Electron Application Context Template

## System Context Layer
- Senior Desktop Application Developer
- Cross-platform development expertise
- Security-first approach for desktop applications
- Performance optimization specialist

## Domain Context Layer
- Technology Stack: Electron, TypeScript, React/Vue
- Build Tools: Electron Forge, webpack
- Security: Context isolation, preload scripts
- Distribution: Auto-updates, code signing, notarization

## Task Context Layer
- Desktop application requirements
- Platform-specific features and integrations
- Security and privacy requirements
- Performance and resource usage constraints
- Distribution and update mechanisms
```

## 📚 Key Takeaways

1. **Security First**: Always use context isolation and preload scripts
2. **Process Separation**: Understand main vs renderer process architecture
3. **Native Integration**: Leverage OS-specific features appropriately
4. **Performance**: Optimize for desktop resource usage patterns
5. **Distribution**: Implement proper code signing and auto-updates
6. **Cross-Platform**: Handle platform differences gracefully

---

**Next**: [Tauri Rust Desktop Development →](tauri.md)