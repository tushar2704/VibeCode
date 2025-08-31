# 🦀 Tauri Rust Desktop Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Build Secure, Lightweight Desktop Apps with Rust*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for Tauri insights and best practices

---

## Overview

Tauri enables building secure, lightweight desktop applications using Rust backend and web frontend. This guide covers **Tauri development**, **Rust backend integration**, **security patterns**, **native APIs**, and **Context Engineering** methodology for high-performance desktop applications.

## 🚀 Tauri Project Setup

### Project Initialization

```bash
# Install Tauri CLI
cargo install tauri-cli

# Create new Tauri project with frontend
npm create tauri-app@latest
# Or with specific frontend
npm create tauri-app@latest -- --template react-ts

# Navigate to project
cd my-tauri-app

# Install dependencies
npm install

# Install Tauri development tools
cargo install tauri-cli --version "^1.0"

# Development
npm run tauri dev

# Build for production
npm run tauri build
```

### Project Structure

```
my-tauri-app/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── state.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── src/                    # Frontend (React/Vue/Vanilla)
│   ├── components/
│   ├── hooks/
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## 🦀 Rust Backend Development

### Main Application Setup

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, State, Window};
use std::sync::Mutex;

mod commands;
mod state;

use commands::*;
use state::AppState;

fn main() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .manage(Mutex::new(app_state))
        .invoke_handler(tauri::generate_handler![
            // File operations
            read_file,
            write_file,
            open_file_dialog,
            save_file_dialog,
            
            // Database operations
            create_todo,
            get_todos,
            update_todo,
            delete_todo,
            
            // System operations
            get_system_info,
            show_notification,
            open_external_url,
            
            // Window operations
            minimize_window,
            maximize_window,
            close_window,
            
            // App state
            get_app_config,
            set_app_config,
        ])
        .setup(|app| {
            // Setup application
            let window = app.get_window("main").unwrap();
            
            // Configure window
            #[cfg(debug_assertions)]
            window.open_devtools();
            
            // Initialize database or other resources
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                // Initialize async resources
                println!("Initializing application resources...");
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Commands Implementation

```rust
// src-tauri/src/commands.rs
use tauri::{State, Window};
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::state::{AppState, Todo, AppConfig};

// File Operations
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e))
    }
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e))
    }
}

#[tauri::command]
pub async fn open_file_dialog(window: Window) -> Result<Option<String>, String> {
    use tauri::api::dialog::FileDialogBuilder;
    
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("Text Files", &["txt", "md", "json"])
        .add_filter("All Files", &["*"])
        .pick_file(move |file_path| {
            tx.send(file_path).unwrap();
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to open file dialog: {}", e))
    }
}

#[tauri::command]
pub async fn save_file_dialog(window: Window) -> Result<Option<String>, String> {
    use tauri::api::dialog::FileDialogBuilder;
    
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("Text Files", &["txt"])
        .add_filter("JSON Files", &["json"])
        .save_file(move |file_path| {
            tx.send(file_path).unwrap();
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to save file dialog: {}", e))
    }
}

// Database Operations (using in-memory state for simplicity)
#[tauri::command]
pub async fn create_todo(
    title: String,
    description: Option<String>,
    state: State<'_, Mutex<AppState>>
) -> Result<Todo, String> {
    let mut app_state = state.lock().unwrap();
    let todo = app_state.create_todo(title, description);
    Ok(todo)
}

#[tauri::command]
pub async fn get_todos(state: State<'_, Mutex<AppState>>) -> Result<Vec<Todo>, String> {
    let app_state = state.lock().unwrap();
    Ok(app_state.get_todos())
}

#[tauri::command]
pub async fn update_todo(
    id: String,
    title: Option<String>,
    description: Option<String>,
    completed: Option<bool>,
    state: State<'_, Mutex<AppState>>
) -> Result<Option<Todo>, String> {
    let mut app_state = state.lock().unwrap();
    Ok(app_state.update_todo(id, title, description, completed))
}

#[tauri::command]
pub async fn delete_todo(
    id: String,
    state: State<'_, Mutex<AppState>>
) -> Result<bool, String> {
    let mut app_state = state.lock().unwrap();
    Ok(app_state.delete_todo(id))
}

// System Operations
#[derive(Serialize)]
pub struct SystemInfo {
    platform: String,
    arch: String,
    version: String,
    total_memory: u64,
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    use sysinfo::{System, SystemExt};
    
    let sys = System::new_all();
    
    Ok(SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: sys.kernel_version().unwrap_or_default(),
        total_memory: sys.total_memory(),
    })
}

#[tauri::command]
pub async fn show_notification(title: String, body: String) -> Result<(), String> {
    use tauri::api::notification::Notification;
    
    Notification::new("com.example.tauri-app")
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
}

#[tauri::command]
pub async fn open_external_url(url: String) -> Result<(), String> {
    use tauri::api::shell;
    
    shell::open(&url, None)
        .map_err(|e| format!("Failed to open URL: {}", e))
}

// Window Operations
#[tauri::command]
pub async fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn maximize_window(window: Window) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

// App Configuration
#[tauri::command]
pub async fn get_app_config(state: State<'_, Mutex<AppState>>) -> Result<AppConfig, String> {
    let app_state = state.lock().unwrap();
    Ok(app_state.get_config())
}

#[tauri::command]
pub async fn set_app_config(
    config: AppConfig,
    state: State<'_, Mutex<AppState>>
) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    app_state.set_config(config);
    Ok(())
}
```

### State Management

```rust
// src-tauri/src/state.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub auto_save: bool,
    pub notification_enabled: bool,
    pub window_bounds: WindowBounds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowBounds {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            auto_save: true,
            notification_enabled: true,
            window_bounds: WindowBounds {
                x: 100,
                y: 100,
                width: 1200,
                height: 800,
            },
        }
    }
}

pub struct AppState {
    todos: HashMap<String, Todo>,
    config: AppConfig,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            todos: HashMap::new(),
            config: AppConfig::default(),
        }
    }

    pub fn create_todo(&mut self, title: String, description: Option<String>) -> Todo {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();
        
        let todo = Todo {
            id: id.clone(),
            title,
            description,
            completed: false,
            created_at: now,
            updated_at: now,
        };

        self.todos.insert(id, todo.clone());
        todo
    }

    pub fn get_todos(&self) -> Vec<Todo> {
        let mut todos: Vec<Todo> = self.todos.values().cloned().collect();
        todos.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        todos
    }

    pub fn update_todo(
        &mut self,
        id: String,
        title: Option<String>,
        description: Option<String>,
        completed: Option<bool>,
    ) -> Option<Todo> {
        if let Some(todo) = self.todos.get_mut(&id) {
            if let Some(title) = title {
                todo.title = title;
            }
            if let Some(description) = description {
                todo.description = Some(description);
            }
            if let Some(completed) = completed {
                todo.completed = completed;
            }
            todo.updated_at = chrono::Utc::now();
            Some(todo.clone())
        } else {
            None
        }
    }

    pub fn delete_todo(&mut self, id: String) -> bool {
        self.todos.remove(&id).is_some()
    }

    pub fn get_config(&self) -> AppConfig {
        self.config.clone()
    }

    pub fn set_config(&mut self, config: AppConfig) {
        self.config = config;
    }
}
```

## ⚛️ Frontend Integration

### React Hooks for Tauri

```typescript
// src/hooks/useTauriCommands.ts
import { invoke } from '@tauri-apps/api/tauri'
import { useState, useEffect, useCallback } from 'react'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface SystemInfo {
  platform: string
  arch: string
  version: string
  total_memory: number
}

export interface AppConfig {
  theme: string
  auto_save: boolean
  notification_enabled: boolean
  window_bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

// File Operations
export const useFileOperations = () => {
  const readFile = useCallback(async (path: string): Promise<string> => {
    return await invoke('read_file', { path })
  }, [])

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    return await invoke('write_file', { path, content })
  }, [])

  const openFileDialog = useCallback(async (): Promise<string | null> => {
    return await invoke('open_file_dialog')
  }, [])

  const saveFileDialog = useCallback(async (): Promise<string | null> => {
    return await invoke('save_file_dialog')
  }, [])

  return { readFile, writeFile, openFileDialog, saveFileDialog }
}

// Todo Operations
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const todos: Todo[] = await invoke('get_todos')
      setTodos(todos)
    } catch (err) {
      setError(err as string)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTodo = useCallback(async (title: string, description?: string) => {
    try {
      const todo: Todo = await invoke('create_todo', { title, description })
      setTodos(prev => [todo, ...prev])
      return todo
    } catch (err) {
      setError(err as string)
      throw err
    }
  }, [])

  const updateTodo = useCallback(async (
    id: string,
    updates: { title?: string; description?: string; completed?: boolean }
  ) => {
    try {
      const todo: Todo | null = await invoke('update_todo', { id, ...updates })
      if (todo) {
        setTodos(prev => prev.map(t => t.id === id ? todo : t))
      }
      return todo
    } catch (err) {
      setError(err as string)
      throw err
    }
  }, [])

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const success: boolean = await invoke('delete_todo', { id })
      if (success) {
        setTodos(prev => prev.filter(t => t.id !== id))
      }
      return success
    } catch (err) {
      setError(err as string)
      throw err
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return {
    todos,
    loading,
    error,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo
  }
}

// System Operations
export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  const loadSystemInfo = useCallback(async () => {
    try {
      const info: SystemInfo = await invoke('get_system_info')
      setSystemInfo(info)
    } catch (error) {
      console.error('Failed to load system info:', error)
    }
  }, [])

  const showNotification = useCallback(async (title: string, body: string) => {
    try {
      await invoke('show_notification', { title, body })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }, [])

  const openExternalUrl = useCallback(async (url: string) => {
    try {
      await invoke('open_external_url', { url })
    } catch (error) {
      console.error('Failed to open URL:', error)
    }
  }, [])

  useEffect(() => {
    loadSystemInfo()
  }, [loadSystemInfo])

  return { systemInfo, showNotification, openExternalUrl }
}

// Window Operations
export const useWindowControls = () => {
  const minimize = useCallback(async () => {
    try {
      await invoke('minimize_window')
    } catch (error) {
      console.error('Failed to minimize window:', error)
    }
  }, [])

  const maximize = useCallback(async () => {
    try {
      await invoke('maximize_window')
    } catch (error) {
      console.error('Failed to maximize window:', error)
    }
  }, [])

  const close = useCallback(async () => {
    try {
      await invoke('close_window')
    } catch (error) {
      console.error('Failed to close window:', error)
    }
  }, [])

  return { minimize, maximize, close }
}

// App Configuration
export const useAppConfig = () => {
  const [config, setConfigState] = useState<AppConfig | null>(null)

  const loadConfig = useCallback(async () => {
    try {
      const config: AppConfig = await invoke('get_app_config')
      setConfigState(config)
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }, [])

  const setConfig = useCallback(async (newConfig: AppConfig) => {
    try {
      await invoke('set_app_config', { config: newConfig })
      setConfigState(newConfig)
    } catch (error) {
      console.error('Failed to set config:', error)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return { config, setConfig }
}
```

### Component Examples

```tsx
// src/components/TodoApp.tsx
import React, { useState } from 'react'
import { useTodos } from '../hooks/useTauriCommands'

export const TodoApp: React.FC = () => {
  const { todos, loading, createTodo, updateTodo, deleteTodo } = useTodos()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoTitle.trim()) {
      try {
        await createTodo(newTodoTitle.trim())
        setNewTodoTitle('')
      } catch (error) {
        console.error('Failed to create todo:', error)
      }
    }
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodo(id, { completed: !completed })
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(id)
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
    }
  }

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      
      <form onSubmit={handleCreateTodo} className="todo-form">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new todo..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newTodoTitle.trim()}>
          Add Todo
        </button>
      </form>

      <div className="todo-list">
        {loading && todos.length === 0 ? (
          <p>Loading todos...</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <label className="todo-checkbox">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                />
                <span className={todo.completed ? 'completed' : ''}>
                  {todo.title}
                </span>
              </label>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// src/components/TitleBar.tsx
import React from 'react'
import { useWindowControls } from '../hooks/useTauriCommands'

export const TitleBar: React.FC = () => {
  const { minimize, maximize, close } = useWindowControls()

  return (
    <div className="title-bar" data-tauri-drag-region>
      <div className="title-bar-content">
        <span className="title">Tauri App</span>
        <div className="title-bar-controls">
          <button onClick={minimize} className="title-bar-button">
            −
          </button>
          <button onClick={maximize} className="title-bar-button">
            □
          </button>
          <button onClick={close} className="title-bar-button close">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
```

## ⚙️ Configuration and Build

### Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "My Tauri App",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "open": true
      },
      "dialog": {
        "all": true,
        "ask": true,
        "confirm": true,
        "message": true,
        "open": true,
        "save": true
      },
      "notification": {
        "all": true
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "startDragging": true
      }
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "© 2024 Your Name",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.example.tauri-app",
      "longDescription": "A modern desktop application built with Tauri",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "My Tauri App",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 600,
        "resizable": true,
        "title": "My Tauri App",
        "width": 800,
        "decorations": false,
        "transparent": true
      }
    ]
  }
}
```

## 🔧 Context Engineering for Tauri

### System Context Template

```markdown
# Tauri Application Context Template

## System Context Layer
- Rust Systems Developer with desktop application expertise
- Security-focused development approach
- Performance optimization specialist
- Cross-platform deployment experience

## Domain Context Layer
- Technology Stack: Rust, Tauri, TypeScript, React/Vue
- Build Tools: Cargo, Vite/webpack
- Security: Sandboxed architecture, allowlist permissions
- Performance: Rust backend, web frontend optimization

## Task Context Layer
- Desktop application requirements
- Security and permission requirements
- Performance and resource constraints
- Cross-platform compatibility needs
- Distribution and update mechanisms
```

## 📚 Key Takeaways

1. **Security by Default**: Tauri's allowlist system provides fine-grained permissions
2. **Performance**: Rust backend offers superior performance and memory safety
3. **Small Bundle Size**: Significantly smaller than Electron applications
4. **Native Integration**: Direct OS API access through Rust
5. **Modern Frontend**: Use any web framework for the UI layer
6. **Type Safety**: End-to-end type safety with TypeScript and Rust

---

**Next**: [Cloud & DevOps Development →](../07-cloud-devops/README.md)