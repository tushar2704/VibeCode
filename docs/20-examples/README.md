# 📦 Code Examples & Templates Repository

> *"Production-ready code examples and project templates with Context Engineering methodology"*

## 🎯 Overview

This comprehensive repository provides **Code Examples & Templates** with **Context Engineering** methodology across all development platforms. Each example includes complete implementation, best practices, and Context Engineering templates for immediate use.

## 🚀 Repository Structure

```
examples/
├── web/
│   ├── frontend/          # React, Vue, Angular templates
│   ├── backend/           # Node.js, Python, Java APIs
│   └── fullstack/         # Complete web applications
├── mobile/
│   ├── react-native/      # Cross-platform mobile apps
│   ├── flutter/           # Flutter applications
│   └── native/            # iOS Swift, Android Kotlin
├── desktop/
│   ├── electron/          # Cross-platform desktop
│   ├── tauri/             # Rust-based desktop apps
│   └── native/            # Platform-specific desktop
├── cloud/
│   ├── docker/            # Containerization examples
│   ├── kubernetes/        # Orchestration templates
│   └── serverless/        # AWS Lambda, Azure Functions
├── specialized/
│   ├── game/              # Unity, Unreal, Web games
│   ├── ai-ml/             # TensorFlow, PyTorch examples
│   ├── blockchain/        # Smart contracts, DApps
│   └── iot/               # Arduino, Raspberry Pi
└── templates/
    ├── project-starters/  # Complete project boilerplates
    ├── component-library/ # Reusable components
    └── testing/           # Testing strategy examples
```

---

## 📋 Context Engineering Template Framework

### Universal Template Structure
```typescript
// Context Engineering Framework Template
interface ContextFramework {
  systemLayer: SystemContext;
  domainLayer: DomainContext;
  taskLayer: TaskContext;
}

interface SystemContext {
  role: string;              // Developer role and expertise
  guidelines: string[];      // Behavioral guidelines
  standards: string[];       // Quality standards
}

interface DomainContext {
  technology: TechStack;     // Platform-specific technologies
  patterns: ArchPattern[];  // Architecture patterns
  practices: BestPractice[]; // Best practices
}

interface TaskContext {
  requirements: string[];    // Specific requirements
  constraints: string[];     // Technical constraints
  objectives: string[];      // Success criteria
}
```

---

## 🌐 Web Development Examples

### Frontend Context Engineering Template
```typescript
// React Context Engineering Implementation
import React, { createContext, useContext, useReducer } from 'react';

// System Context Layer
const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Domain Context Layer
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

// Task Context Layer
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    loginUser: async (credentials: LoginCredentials) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const user = await authService.login(credentials);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};
```

### Backend API Template
```typescript
// Node.js Express Context Engineering Template
import express from 'express';

// System Context Layer - Application Configuration
interface AppConfig {
  port: number;
  dbUrl: string;
  environment: 'development' | 'production';
}

// Domain Context Layer - Business Logic
class UserService {
  constructor(private db: Database, private logger: Logger) {}

  async createUser(userData: CreateUserData): Promise<User> {
    this.logger.info('Creating user', { email: userData.email });
    
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    return this.db.user.create({
      ...userData,
      password: hashedPassword
    });
  }
}

// Task Context Layer - API Routes
class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
```

---

## 📱 Mobile Development Examples

### React Native Template
```typescript
// React Native Context Engineering Template
import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mobile App Context with offline support
const MobileAppContext = createContext<MobileAppContextValue | undefined>(undefined);

export const MobileAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mobileReducer, initialState);

  const actions = {
    loginUser: async (credentials: LoginCredentials) => {
      try {
        const user = await authService.login(credentials);
        await AsyncStorage.setItem('user_token', user.token);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    syncOfflineData: async () => {
      const offlineData = await AsyncStorage.getItem('offline_data');
      if (offlineData && state.networkStatus === 'online') {
        await apiService.syncData(JSON.parse(offlineData));
        await AsyncStorage.removeItem('offline_data');
      }
    }
  };

  return (
    <MobileAppContext.Provider value={{ state, actions }}>
      {children}
    </MobileAppContext.Provider>
  );
};
```

### Flutter Template
```dart
// Flutter Context Engineering Template
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AppState extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;

  User? get user => _user;
  bool get isLoading => _isLoading;

  Future<void> loginUser(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final user = await AuthService.login(email, password);
      _user = user;
    } catch (error) {
      // Handle error
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

class ContextEngineeredApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(),
      child: MaterialApp(
        title: 'Context Engineered App',
        home: Consumer<AppState>(
          builder: (context, appState, child) {
            return appState.user != null ? DashboardScreen() : LoginScreen();
          },
        ),
      ),
    );
  }
}
```

---

## 🖥️ Desktop Development Examples

### Electron Template
```typescript
// Electron Context Engineering Template
import { app, BrowserWindow, ipcMain } from 'electron';

class ElectronApp {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      }
    });

    this.mainWindow.loadFile('index.html');
  }

  private setupIPC(): void {
    ipcMain.handle('file:open', async () => {
      const { dialog } = require('electron');
      return await dialog.showOpenDialog(this.mainWindow!);
    });

    ipcMain.handle('app:getVersion', () => app.getVersion());
  }
}
```

---

## ☁️ Cloud & Infrastructure Examples

### Docker Template
```dockerfile
# Multi-stage Docker Template
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001
WORKDIR /app
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Kubernetes Template
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibe-coding-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vibe-coding-app
  template:
    metadata:
      labels:
        app: vibe-coding-app
    spec:
      containers:
      - name: app
        image: vibecoding/app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 🎮 Specialized Examples

### Unity Game Template
```csharp
// Unity Context Engineering Template
using UnityEngine;

public class GameContext : MonoBehaviour
{
    public static GameContext Instance { get; private set; }
    
    [Header("Game Configuration")]
    public GameConfig gameConfig;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeGame();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeGame()
    {
        // Initialize game systems
        GameManager.Initialize(gameConfig);
        PlayerManager.Initialize();
        UIManager.Initialize();
    }
}
```

### AI/ML Template
```python
# TensorFlow Context Engineering Template
import tensorflow as tf
from typing import Dict, Any

class MLModelContext:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.tokenizer = None
        
    def initialize_model(self):
        """Initialize model with context configuration"""
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(10, activation='softmax')
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
    
    def train_with_context(self, train_data, validation_data):
        """Train model with context-aware callbacks"""
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=3),
            tf.keras.callbacks.ModelCheckpoint('best_model.h5'),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5)
        ]
        
        return self.model.fit(
            train_data,
            validation_data=validation_data,
            epochs=self.config['epochs'],
            callbacks=callbacks
        )
```

---

## 🧪 Testing Templates

### Comprehensive Testing Strategy
```typescript
// Testing Context Engineering Template
describe('User Authentication Service', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<Database>;
  
  beforeEach(() => {
    mockDb = createMockDatabase();
    userService = new UserService(mockDb, mockLogger);
  });

  describe('Context Layer Testing', () => {
    it('should handle user creation with proper context', async () => {
      // System Context - Setup
      const userData = { email: 'test@example.com', password: 'password123' };
      
      // Domain Context - Mock dependencies
      mockDb.user.create.mockResolvedValue(mockUser);
      
      // Task Context - Execute and verify
      const result = await userService.createUser(userData);
      
      expect(result).toEqual(mockUser);
      expect(mockDb.user.create).toHaveBeenCalledWith({
        ...userData,
        password: expect.any(String) // Hashed password
      });
    });
  });
});
```

---

## 📚 Quick Start Guide

### 1. Choose Your Platform Template
```bash
# Clone the repository
git clone https://github.com/vibecoding/examples.git
cd examples

# Navigate to your platform
cd web/frontend/react  # For React applications
cd mobile/react-native # For mobile development
cd desktop/electron    # For desktop applications
```

### 2. Initialize Project
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development
npm run dev
```

### 3. Implement Context Engineering
1. **System Context**: Define role, guidelines, and standards
2. **Domain Context**: Configure technology stack and patterns
3. **Task Context**: Specify requirements and objectives

### 4. Customize and Extend
- Modify configuration files
- Add platform-specific features
- Implement business logic
- Add comprehensive testing

---

## 🔗 Related Resources

- [Context Engineering Methodology](../02-context-engineering/README.md)
- [Platform-Specific Guides](../TOC.md)
- [Testing Strategies](../09-testing-qa/README.md)
- [Deployment Patterns](../07-cloud-devops/README.md)

---

**Next**: [Interactive Tutorials & Exercises](../21-tutorials/README.md) | **Up**: [Table of Contents](../TOC.md)

*This repository provides production-ready code examples and templates with Context Engineering methodology for rapid development across all platforms.*