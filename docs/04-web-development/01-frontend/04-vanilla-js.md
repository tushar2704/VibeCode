# 🟨 Vanilla JavaScript Excellence

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Modern JavaScript Without Frameworks*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for JavaScript insights and best practices

---

## Overview

Vanilla JavaScript is the foundation of web development. This guide covers **modern ES6+ features**, **Web APIs**, performance patterns, and **Context Engineering** methodology for building fast, standards-compliant web applications without frameworks.

## 🚀 Modern ES6+ Features

### Advanced Module Patterns

```javascript
// user-manager.js - ESM with named and default exports
export class UserManager {
  #users = new Map()
  #eventBus = new EventTarget()
  
  constructor(apiClient) {
    this.apiClient = apiClient
  }
  
  async addUser(userData) {
    try {
      const user = await this.apiClient.createUser(userData)
      this.#users.set(user.id, user)
      
      // Dispatch custom event
      this.#eventBus.dispatchEvent(new CustomEvent('user:added', {
        detail: { user }
      }))
      
      return user
    } catch (error) {
      throw new Error(`Failed to add user: ${error.message}`)
    }
  }
  
  getUser(id) {
    return this.#users.get(id) ?? null
  }
  
  getAllUsers() {
    return Array.from(this.#users.values())
  }
  
  on(event, handler) {
    this.#eventBus.addEventListener(event, handler)
  }
  
  off(event, handler) {
    this.#eventBus.removeEventListener(event, handler)
  }
}

// Export utility functions
export const formatUserName = (user) => 
  `${user.firstName} ${user.lastName}`.trim()

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Default export
export default UserManager
```

### Dynamic Imports and Code Splitting

```javascript
// app.js - Dynamic imports for performance
class App {
  async loadUserModule() {
    try {
      const { UserManager, formatUserName } = await import('./user-manager.js')
      return new UserManager(this.apiClient)
    } catch (error) {
      console.error('Failed to load user module:', error)
      throw error
    }
  }
  
  async loadChartLibrary() {
    // Conditional loading based on feature usage
    if (!this.chartLibrary) {
      this.chartLibrary = await import('./chart-library.js')
    }
    return this.chartLibrary
  }
  
  async handleRouteChange(route) {
    const routeModules = {
      '/dashboard': () => import('./pages/dashboard.js'),
      '/users': () => import('./pages/users.js'),
      '/reports': () => import('./pages/reports.js')
    }
    
    const loadModule = routeModules[route]
    if (loadModule) {
      const module = await loadModule()
      module.default.render(this.appContainer)
    }
  }
}
```

### Advanced Async Patterns

```javascript
// async-utils.js - Advanced async patterns
export class AsyncQueue {
  #queue = []
  #running = false
  #concurrency = 1
  
  constructor(concurrency = 1) {
    this.#concurrency = concurrency
  }
  
  async add(asyncFunction) {
    return new Promise((resolve, reject) => {
      this.#queue.push({
        fn: asyncFunction,
        resolve,
        reject
      })
      
      this.#process()
    })
  }
  
  async #process() {
    if (this.#running || this.#queue.length === 0) return
    
    this.#running = true
    const runningTasks = []
    
    while (this.#queue.length > 0 && runningTasks.length < this.#concurrency) {
      const task = this.#queue.shift()
      const promise = this.#runTask(task)
      runningTasks.push(promise)
    }
    
    await Promise.all(runningTasks)
    this.#running = false
    
    if (this.#queue.length > 0) {
      this.#process()
    }
  }
  
  async #runTask({ fn, resolve, reject }) {
    try {
      const result = await fn()
      resolve(result)
    } catch (error) {
      reject(error)
    }
  }
}

// Retry utility with exponential backoff
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      
      const backoffDelay = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }
}

// Timeout wrapper
export function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ])
}
```

## 🌐 Modern Web APIs

### Intersection Observer for Performance

```javascript
// lazy-loader.js - Efficient lazy loading
export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    )
  }
  
  observe(element, callback) {
    element._lazyCallback = callback
    this.observer.observe(element)
  }
  
  unobserve(element) {
    delete element._lazyCallback
    this.observer.unobserve(element)
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target._lazyCallback) {
        entry.target._lazyCallback(entry.target)
        this.unobserve(entry.target)
      }
    })
  }
  
  // Lazy load images
  static loadImage(img) {
    return new Promise((resolve, reject) => {
      const src = img.dataset.src
      if (!src) return reject(new Error('No data-src attribute'))
      
      const image = new Image()
      image.onload = () => {
        img.src = src
        img.classList.add('loaded')
        resolve(img)
      }
      image.onerror = reject
      image.src = src
    })
  }
  
  // Lazy load components
  static async loadComponent(container) {
    const componentName = container.dataset.component
    if (!componentName) return
    
    try {
      const module = await import(`./components/${componentName}.js`)
      const component = new module.default(container)
      component.render()
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error)
    }
  }
}

// Usage
const lazyLoader = new LazyLoader()

// Lazy load images
document.querySelectorAll('img[data-src]').forEach(img => {
  lazyLoader.observe(img, LazyLoader.loadImage)
})

// Lazy load components
document.querySelectorAll('[data-component]').forEach(element => {
  lazyLoader.observe(element, LazyLoader.loadComponent)
})
```

### Service Worker for Caching

```javascript
// sw.js - Service Worker for performance
const CACHE_NAME = 'app-v1'
const STATIC_ASSETS = [
  '/',
  '/css/app.css',
  '/js/app.js',
  '/images/logo.svg'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // API requests - network first
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }
  
  // Static assets - cache first
  event.respondWith(cacheFirstStrategy(request))
})

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return new Response('Offline', { status: 503 })
  }
}
```

### Web Components for Reusability

```javascript
// user-card.js - Custom Web Component
export class UserCard extends HTMLElement {
  static get observedAttributes() {
    return ['user-id', 'theme']
  }
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
  }
  
  connectedCallback() {
    this.render()
    this.setupEventListeners()
    
    // Load user data if user-id is provided
    const userId = this.getAttribute('user-id')
    if (userId) {
      this.loadUser(userId)
    }
  }
  
  disconnectedCallback() {
    this.cleanup()
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'user-id':
          this.loadUser(newValue)
          break
        case 'theme':
          this.updateTheme(newValue)
          break
      }
    }
  }
  
  async loadUser(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`)
      this.user = await response.json()
      this.render()
    } catch (error) {
      this.renderError(error.message)
    }
  }
  
  render() {
    const theme = this.getAttribute('theme') || 'light'
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
        }
        
        .card {
          border: 1px solid var(--border-color, #e1e5e9);
          border-radius: 8px;
          padding: 1rem;
          background: var(--bg-color, white);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .card[data-theme="dark"] {
          --border-color: #404040;
          --bg-color: #2a2a2a;
          --text-color: white;
        }
        
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
          color: var(--text-color, #1a1a1a);
        }
        
        .email {
          color: var(--text-muted, #666);
          font-size: 0.875rem;
        }
        
        .actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        
        button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--primary-color, #007bff);
          background: var(--primary-color, #007bff);
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        button.secondary {
          background: transparent;
          color: var(--primary-color, #007bff);
        }
      </style>
      
      <div class="card" data-theme="${theme}">
        ${this.user ? this.renderUser() : this.renderLoading()}
      </div>
    `
  }
  
  renderUser() {
    return `
      <div class="header">
        <img class="avatar" src="${this.user.avatar || '/default-avatar.png'}" alt="${this.user.name}">
        <div class="info">
          <h3 class="name">${this.user.name}</h3>
          <p class="email">${this.user.email}</p>
        </div>
      </div>
      <div class="actions">
        <button data-action="view">View Profile</button>
        <button data-action="message" class="secondary">Message</button>
      </div>
    `
  }
  
  renderLoading() {
    return '<div class="loading">Loading user...</div>'
  }
  
  renderError(message) {
    this.shadowRoot.querySelector('.card').innerHTML = `
      <div class="error">Error: ${message}</div>
    `
  }
  
  setupEventListeners() {
    this.shadowRoot.addEventListener('click', this.handleClick.bind(this))
  }
  
  handleClick(event) {
    const action = event.target.dataset.action
    if (!action || !this.user) return
    
    const customEvent = new CustomEvent('user-action', {
      detail: {
        action,
        user: this.user
      },
      bubbles: true
    })
    
    this.dispatchEvent(customEvent)
  }
  
  updateTheme(theme) {
    const card = this.shadowRoot.querySelector('.card')
    if (card) {
      card.setAttribute('data-theme', theme)
    }
  }
  
  cleanup() {
    // Cleanup any event listeners or subscriptions
  }
}

// Register the custom element
customElements.define('user-card', UserCard)
```

## 🏗️ Modern Architecture Patterns

### Event-Driven Architecture

```javascript
// event-bus.js - Global event system
export class EventBus extends EventTarget {
  constructor() {
    super()
    this.debug = false
  }
  
  emit(eventType, data = null) {
    const event = new CustomEvent(eventType, {
      detail: data
    })
    
    if (this.debug) {
      console.log(`[EventBus] Emitting: ${eventType}`, data)
    }
    
    this.dispatchEvent(event)
    return this
  }
  
  on(eventType, handler) {
    this.addEventListener(eventType, handler)
    return this
  }
  
  off(eventType, handler) {
    this.removeEventListener(eventType, handler)
    return this
  }
  
  once(eventType, handler) {
    const onceHandler = (event) => {
      handler(event)
      this.off(eventType, onceHandler)
    }
    this.on(eventType, onceHandler)
    return this
  }
  
  enableDebug() {
    this.debug = true
    return this
  }
}

// Create global instance
export const eventBus = new EventBus()

// Usage in modules
import { eventBus } from './event-bus.js'

// User module
export class UserModule {
  async createUser(userData) {
    const user = await api.createUser(userData)
    eventBus.emit('user:created', user)
    return user
  }
}

// Notification module
export class NotificationModule {
  constructor() {
    eventBus.on('user:created', this.showUserCreatedNotification.bind(this))
    eventBus.on('user:deleted', this.showUserDeletedNotification.bind(this))
  }
  
  showUserCreatedNotification(event) {
    const user = event.detail
    this.show(`Welcome, ${user.name}!`, 'success')
  }
}
```

### State Management Pattern

```javascript
// state-manager.js - Simple state management
export class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState }
    this.listeners = new Map()
    this.middleware = []
  }
  
  getState() {
    return { ...this.state }
  }
  
  setState(updates) {
    const prevState = { ...this.state }
    const nextState = { ...this.state, ...updates }
    
    // Run middleware
    const action = { type: 'SET_STATE', payload: updates }
    const processedState = this.middleware.reduce(
      (state, middleware) => middleware(state, action, prevState),
      nextState
    )
    
    this.state = processedState
    this.notifyListeners(prevState, this.state)
  }
  
  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set())
    }
    this.listeners.get(path).add(callback)
    
    // Return unsubscribe function
    return () => {
      const pathListeners = this.listeners.get(path)
      if (pathListeners) {
        pathListeners.delete(callback)
      }
    }
  }
  
  notifyListeners(prevState, nextState) {
    this.listeners.forEach((callbacks, path) => {
      const prevValue = this.getNestedValue(prevState, path)
      const nextValue = this.getNestedValue(nextState, path)
      
      if (prevValue !== nextValue) {
        callbacks.forEach(callback => {
          callback(nextValue, prevValue)
        })
      }
    })
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  addMiddleware(middleware) {
    this.middleware.push(middleware)
  }
}

// Logger middleware
const loggerMiddleware = (state, action, prevState) => {
  console.group(`[State] ${action.type}`)
  console.log('Previous state:', prevState)
  console.log('Action:', action)
  console.log('Next state:', state)
  console.groupEnd()
  return state
}

// Usage
const store = new StateManager({
  user: null,
  users: [],
  loading: false
})

store.addMiddleware(loggerMiddleware)

// Subscribe to changes
const unsubscribe = store.subscribe('user', (user, prevUser) => {
  console.log('User changed:', user)
})

// Update state
store.setState({ user: { id: 1, name: 'John' } })
```

## 🎯 Performance Optimization

### DOM Performance Patterns

```javascript
// dom-utils.js - Efficient DOM manipulation
export class DOMUtils {
  // Batch DOM operations
  static batchUpdate(callback) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        callback()
        resolve()
      })
    })
  }
  
  // Virtual scrolling for large lists
  static createVirtualScroller(container, items, renderItem, itemHeight = 50) {
    const viewport = {
      height: container.clientHeight,
      scrollTop: 0
    }
    
    const visibleItems = Math.ceil(viewport.height / itemHeight) + 2
    const totalHeight = items.length * itemHeight
    
    const scrollContainer = document.createElement('div')
    scrollContainer.style.height = `${totalHeight}px`
    scrollContainer.style.position = 'relative'
    
    const renderVisible = () => {
      const startIndex = Math.floor(viewport.scrollTop / itemHeight)
      const endIndex = Math.min(startIndex + visibleItems, items.length)
      
      // Clear existing items
      scrollContainer.innerHTML = ''
      
      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const item = renderItem(items[i], i)
        item.style.position = 'absolute'
        item.style.top = `${i * itemHeight}px`
        item.style.height = `${itemHeight}px`
        scrollContainer.appendChild(item)
      }
    }
    
    container.addEventListener('scroll', () => {
      viewport.scrollTop = container.scrollTop
      requestAnimationFrame(renderVisible)
    })
    
    container.appendChild(scrollContainer)
    renderVisible()
  }
  
  // Efficient event delegation
  static delegate(container, selector, eventType, handler) {
    container.addEventListener(eventType, (event) => {
      const target = event.target.closest(selector)
      if (target && container.contains(target)) {
        handler.call(target, event)
      }
    })
  }
  
  // Debounced resize observer
  static observeResize(element, callback, delay = 100) {
    let timeoutId
    
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        callback(entries)
      }, delay)
    })
    
    resizeObserver.observe(element)
    
    return () => resizeObserver.disconnect()
  }
}
```

## 🔧 Context Engineering for Vanilla JS

### System Context Template

```markdown
# Vanilla JavaScript Application Context Template

## System Context Layer
- Expert JavaScript Developer with modern standards
- Performance and accessibility focus
- Progressive enhancement approach
- Web standards specialist

## Domain Context Layer
- Technology Stack: Modern ES6+, Web APIs, Build Tools
- Module System: ES Modules
- Styling: Modern CSS (Grid, Flexbox, Custom Properties)
- Build Tools: Vite, Rollup, or webpack
- Testing: Jest or Vitest

## Task Context Layer
- Performance requirements (First Contentful Paint, etc.)
- Browser compatibility requirements
- Accessibility and SEO requirements
- Progressive Web App features
```

### Project Structure Template

```
src/
├── components/           # Web components and UI modules
├── modules/              # Feature modules
├── utils/                # Utility functions
├── services/             # API and business logic
├── styles/               # CSS modules and themes
├── assets/               # Static assets
├── sw.js                 # Service worker
└── app.js                # Application entry point
```

## 📚 Key Takeaways

1. **Standards-First**: Modern web standards and APIs
2. **Performance Excellence**: Minimal overhead, optimal loading
3. **Progressive Enhancement**: Works everywhere, enhanced where supported
4. **Future-Proof**: Standards-based, framework-independent
5. **Modular Architecture**: ES modules and clean separation of concerns

---

**Next**: [Modern CSS & UI Frameworks →](05-css-frameworks.md)