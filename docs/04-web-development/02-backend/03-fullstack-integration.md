# 🌐 Full-Stack Integration

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Frontend-Backend Integration Patterns*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for full-stack insights and best practices

---

## Overview

Full-stack integration is about seamlessly connecting frontend and backend systems. This guide covers **API design patterns**, **authentication flows**, **real-time communication**, **state synchronization**, and **deployment strategies** for modern web applications.

## 🔗 API Design Patterns

### RESTful API Design

```javascript
// backend/routes/users.js - Express.js REST API
import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { UserService } from '../services/UserService.js'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'

const router = express.Router()
const userService = new UserService()

// GET /api/users - List users with pagination and filtering
router.get('/',
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isLength({ min: 1, max: 100 }),
    query('role').optional().isIn(['admin', 'user', 'moderator']),
    query('status').optional().isIn(['active', 'inactive', 'pending'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = ''
      } = req.query

      const result = await userService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        filters: { role, status }
      })

      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
          hasNext: result.page * result.limit < result.total,
          hasPrev: result.page > 1
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

// GET /api/users/:id - Get single user
router.get('/:id',
  [param('id').isUUID().withMessage('Invalid user ID format')],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const user = await userService.getUserById(req.params.id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
)

// POST /api/users - Create new user
router.post('/',
  authMiddleware,
  [
    body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'user', 'moderator']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { name, email, password, role = 'user' } = req.body

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        })
      }

      const user = await userService.createUser({
        name,
        email,
        password,
        role,
        createdBy: req.user.id
      })

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
)

// PUT /api/users/:id - Update user
router.put('/:id',
  authMiddleware,
  [
    param('id').isUUID(),
    body('name').optional().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['admin', 'user', 'moderator']),
    body('status').optional().isIn(['active', 'inactive', 'pending'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const userId = req.params.id
      const updates = req.body

      // Check if user exists
      const existingUser = await userService.getUserById(userId)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Authorization check
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user'
        })
      }

      const updatedUser = await userService.updateUser(userId, updates)

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
)

export default router
```

### GraphQL API Design

```javascript
// backend/graphql/schema.js - GraphQL Schema
import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    status: UserStatus!
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
    postCount: Int!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    status: PostStatus!
    author: User!
    tags: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum Role {
    ADMIN
    USER
    MODERATOR
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
  }

  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: Role = USER
  }

  input UserUpdateInput {
    name: String
    email: String
    role: Role
    status: UserStatus
  }

  input PostInput {
    title: String!
    content: String!
    tags: [String!]
    status: PostStatus = DRAFT
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Query {
    # User queries
    user(id: ID!): User
    users(
      first: Int
      after: String
      search: String
      role: Role
      status: UserStatus
    ): UserConnection!
    
    # Post queries
    post(id: ID!): Post
    posts(
      first: Int
      after: String
      authorId: ID
      status: PostStatus
    ): PostConnection!
  }

  type Mutation {
    # User mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserUpdateInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Post mutations
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: PostInput!): Post!
    deletePost(id: ID!): Boolean!
  }

  type Subscription {
    userCreated: User!
    userUpdated(id: ID): User!
    postCreated: Post!
    postUpdated(authorId: ID): Post!
  }

  scalar DateTime
`

// backend/graphql/resolvers.js - GraphQL Resolvers
export const resolvers = {
  Query: {
    user: async (_, { id }, { dataSources, user }) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      return await dataSources.userAPI.getUserById(id)
    },

    users: async (_, args, { dataSources, user }) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      
      const { first = 20, after, search, role, status } = args
      
      return await dataSources.userAPI.getUsers({
        first,
        after,
        filters: { search, role, status }
      })
    },

    posts: async (_, args, { dataSources }) => {
      const { first = 20, after, authorId, status } = args
      
      return await dataSources.postAPI.getPosts({
        first,
        after,
        filters: { authorId, status }
      })
    }
  },

  Mutation: {
    createUser: async (_, { input }, { dataSources, user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenError('Not authorized')
      }
      
      return await dataSources.userAPI.createUser(input)
    },

    createPost: async (_, { input }, { dataSources, user }) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      
      return await dataSources.postAPI.createPost({
        ...input,
        authorId: user.id
      })
    }
  },

  Subscription: {
    userCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['USER_CREATED'])
    },

    postCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['POST_CREATED'])
    }
  },

  User: {
    posts: async (user, _, { dataSources }) => {
      return await dataSources.postAPI.getPostsByAuthor(user.id)
    },

    postCount: async (user, _, { dataSources }) => {
      return await dataSources.postAPI.getPostCountByAuthor(user.id)
    }
  }
}
```

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```javascript
// frontend/services/auth.js - Frontend Auth Service
export class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL
    this.token = localStorage.getItem('accessToken')
    this.refreshToken = localStorage.getItem('refreshToken')
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store tokens
      this.token = data.accessToken
      this.refreshToken = data.refreshToken
      localStorage.setItem('accessToken', this.token)
      localStorage.setItem('refreshToken', this.refreshToken)

      // Decode and store user info
      const user = this.decodeToken(this.token)
      localStorage.setItem('user', JSON.stringify(user))

      return { user, token: this.token }
    } catch (error) {
      throw error
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      const data = await response.json()

      if (!response.ok) {
        this.logout()
        throw new Error(data.message || 'Token refresh failed')
      }

      this.token = data.accessToken
      localStorage.setItem('accessToken', this.token)

      return this.token
    } catch (error) {
      this.logout()
      throw error
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    let token = this.token

    // Try request with current token
    let response = await this.makeRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    })

    // If token expired, refresh and retry
    if (response.status === 401) {
      try {
        token = await this.refreshAccessToken()
        response = await this.makeRequest(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (error) {
        this.logout()
        throw error
      }
    }

    return response
  }

  async makeRequest(url, options) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    return await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
  }

  logout() {
    this.token = null
    this.refreshToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Redirect to login page
    window.location.href = '/login'
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated() {
    return !!this.token && !this.isTokenExpired()
  }

  isTokenExpired() {
    if (!this.token) return true
    
    try {
      const payload = this.decodeToken(this.token)
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  decodeToken(token) {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  }

  hasRole(role) {
    const user = this.getCurrentUser()
    return user && user.role === role
  }

  hasPermission(permission) {
    const user = this.getCurrentUser()
    return user && user.permissions && user.permissions.includes(permission)
  }
}

// Create singleton instance
export const authService = new AuthService()
```

### Protected Route Component

```javascript
// frontend/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from './LoadingSpinner'

export function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  requiredPermission = null 
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredRole }} 
        replace 
      />
    )
  }

  // Check permission requirement
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredPermission }} 
        replace 
      />
    )
  }

  return children
}

// Usage in App.jsx
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute requiredPermission="users:read">
          <UserList />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
```

## 🔄 Real-Time Communication

### WebSocket Implementation

```javascript
// backend/websocket/socketHandler.js - Socket.IO Server
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { UserService } from '../services/UserService.js'

export function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        throw new Error('No token provided')
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await UserService.getUserById(decoded.userId)
      
      if (!user) {
        throw new Error('User not found')
      }

      socket.userId = user.id
      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`)

    // Join user to their personal room
    socket.join(`user:${socket.userId}`)

    // Join user to role-based rooms
    socket.join(`role:${socket.user.role}`)

    // Handle chat messages
    socket.on('chat:message', async (data) => {
      try {
        const { roomId, message } = data
        
        // Validate user can send to this room
        const canSend = await validateUserCanSendToRoom(socket.userId, roomId)
        if (!canSend) {
          socket.emit('error', { message: 'Not authorized to send to this room' })
          return
        }

        const chatMessage = {
          id: generateId(),
          roomId,
          userId: socket.userId,
          user: {
            id: socket.user.id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          message,
          timestamp: new Date().toISOString()
        }

        // Save message to database
        await saveMessage(chatMessage)

        // Broadcast to room
        io.to(`room:${roomId}`).emit('chat:message', chatMessage)
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle joining rooms
    socket.on('room:join', async (roomId) => {
      try {
        const canJoin = await validateUserCanJoinRoom(socket.userId, roomId)
        if (canJoin) {
          socket.join(`room:${roomId}`)
          socket.emit('room:joined', { roomId })
          
          // Notify others in room
          socket.to(`room:${roomId}`).emit('user:joined', {
            userId: socket.userId,
            user: socket.user
          })
        } else {
          socket.emit('error', { message: 'Not authorized to join this room' })
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    // Handle leaving rooms
    socket.on('room:leave', (roomId) => {
      socket.leave(`room:${roomId}`)
      socket.emit('room:left', { roomId })
      
      socket.to(`room:${roomId}`).emit('user:left', {
        userId: socket.userId,
        user: socket.user
      })
    })

    // Handle typing indicators
    socket.on('typing:start', (roomId) => {
      socket.to(`room:${roomId}`).emit('typing:start', {
        userId: socket.userId,
        user: socket.user
      })
    })

    socket.on('typing:stop', (roomId) => {
      socket.to(`room:${roomId}`).emit('typing:stop', {
        userId: socket.userId
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`)
      
      // Notify all rooms user was in
      socket.rooms.forEach(room => {
        if (room.startsWith('room:')) {
          socket.to(room).emit('user:offline', {
            userId: socket.userId
          })
        }
      })
    })
  })

  // Admin broadcast endpoint
  io.adminBroadcast = (event, data, filter = {}) => {
    let target = io

    if (filter.role) {
      target = io.to(`role:${filter.role}`)
    }

    if (filter.userId) {
      target = io.to(`user:${filter.userId}`)
    }

    target.emit(event, data)
  }

  return io
}
```

### Frontend WebSocket Client

```javascript
// frontend/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

export function useWebSocket() {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return

    socketRef.current = io(process.env.REACT_APP_WS_URL, {
      auth: {
        token
      }
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('error', (errorData) => {
      setError(errorData.message)
    })

    socket.on('connect_error', (error) => {
      setError('Connection failed')
      setIsConnected(false)
    })

    return socket
  }, [token, isAuthenticated])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    }
  }, [isConnected])

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
    }
  }, [])

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off
  }
}

// Chat component using WebSocket
export function ChatRoom({ roomId }) {
  const { emit, on, off, isConnected } = useWebSocket()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (!isConnected || !roomId) return

    // Join room
    emit('room:join', roomId)

    // Listen for messages
    const handleMessage = (message) => {
      setMessages(prev => [...prev, message])
    }

    const handleUserJoined = (data) => {
      console.log(`${data.user.name} joined the room`)
    }

    const handleTypingStart = (data) => {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
    }

    const handleTypingStop = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    }

    on('chat:message', handleMessage)
    on('user:joined', handleUserJoined)
    on('typing:start', handleTypingStart)
    on('typing:stop', handleTypingStop)

    return () => {
      off('chat:message', handleMessage)
      off('user:joined', handleUserJoined)
      off('typing:start', handleTypingStart)
      off('typing:stop', handleTypingStop)
      emit('room:leave', roomId)
    }
  }, [roomId, isConnected, emit, on, off])

  const sendMessage = () => {
    if (newMessage.trim() && isConnected) {
      emit('chat:message', {
        roomId,
        message: newMessage.trim()
      })
      setNewMessage('')
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (e.target.value) {
      emit('typing:start', roomId)
    } else {
      emit('typing:stop', roomId)
    }
  }

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.user.name}:</strong> {message.message}
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(u => u.user.name).join(', ')} typing...
          </div>
        )}
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected || !newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}
```

## 📚 Key Takeaways

1. **API Design**: RESTful and GraphQL patterns for scalable APIs
2. **Authentication**: JWT-based auth with refresh token strategy
3. **Real-Time**: WebSocket integration for live features
4. **Error Handling**: Comprehensive error handling and validation
5. **Security**: Authorization, rate limiting, and input validation

---

**Next**: [Mobile Development →](../05-mobile-development/README.md)