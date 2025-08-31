# ⚛️ React Native Cross-Platform Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Build Native Mobile Apps with JavaScript*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for React Native insights and best practices

---

## Overview

React Native enables building truly native mobile applications using JavaScript and React. This guide covers **React Native development**, **cross-platform strategies**, **native module integration**, and **Context Engineering** methodology for scalable mobile apps.

## 🚀 React Native Fundamentals

### Modern React Native Setup

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project with TypeScript
npx react-native init MyApp --template react-native-template-typescript

# Or using Expo (managed workflow)
npx create-expo-app MyApp --template blank-typescript

# Development setup for iOS (macOS only)
cd MyApp/ios && pod install

# Start Metro bundler
npx react-native start

# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@hooks/*": ["hooks/*"],
      "@navigation/*": ["navigation/*"],
      "@store/*": ["store/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": [
    "src/**/*",
    "index.js"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js"
  ]
}
```

## 🧩 Component Development Patterns

### Reusable UI Components

```typescript
// src/components/Button/Button.tsx
import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  testID?: string
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID
}) => {
  const { theme } = useTheme()

  const buttonStyles = [
    styles.base,
    styles[size],
    styles[variant],
    {
      backgroundColor: variant === 'primary' ? theme.colors.primary : 
                      variant === 'secondary' ? theme.colors.secondary :
                      'transparent'
    },
    disabled && styles.disabled,
    style
  ]

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    {
      color: variant === 'outline' ? theme.colors.primary : theme.colors.onPrimary
    },
    disabled && styles.disabledText,
    textStyle
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.primary : theme.colors.onPrimary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56
  },
  primary: {
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  secondary: {
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  outline: {
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  disabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0
  },
  text: {
    fontWeight: '600',
    textAlign: 'center'
  },
  smallText: {
    fontSize: 14
  },
  mediumText: {
    fontSize: 16
  },
  largeText: {
    fontSize: 18
  },
  disabledText: {
    opacity: 0.7
  }
})
```

### Advanced List Components

```typescript
// src/components/VirtualizedList/VirtualizedList.tsx
import React, { useMemo, useCallback } from 'react'
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
  Text
} from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface VirtualizedListProps<T> {
  data: T[]
  renderItem: ListRenderItem<T>
  keyExtractor: (item: T, index: number) => string
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  onEndReached?: () => void
  onEndReachedThreshold?: number
  emptyText?: string
  errorText?: string
  error?: boolean
  itemHeight?: number
  numColumns?: number
  horizontal?: boolean
}

export function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  emptyText = 'No items found',
  errorText = 'Something went wrong',
  error = false,
  itemHeight,
  numColumns = 1,
  horizontal = false
}: VirtualizedListProps<T>) {
  const { theme } = useTheme()

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        {error ? errorText : emptyText}
      </Text>
    </View>
  ), [error, errorText, emptyText, theme.colors.onSurface])

  const renderFooter = useCallback(() => {
    if (!loading) return null
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    )
  }, [loading, theme.colors.primary])

  const refreshControl = useMemo(() => (
    onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />
    ) : undefined
  ), [refreshing, onRefresh, theme.colors.primary])

  const getItemLayout = useCallback((data: any, index: number) => (
    itemHeight ? {
      length: itemHeight,
      offset: itemHeight * index,
      index
    } : undefined
  ), [itemHeight])

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      getItemLayout={itemHeight ? getItemLayout : undefined}
      numColumns={numColumns}
      horizontal={horizontal}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center'
  }
})
```

## 🗂️ Navigation with React Navigation

### Navigation Structure

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Profile: { userId: string }
  Settings: undefined
  PostDetail: { postId: string; title: string }
}

export type MainTabParamList = {
  Home: undefined
  Search: undefined
  Notifications: undefined
  Profile: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

// src/navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '@hooks/useAuth'
import { AuthStack } from './AuthStack'
import { MainTabs } from './MainTabs'
import { ProfileScreen } from '@screens/ProfileScreen'
import { SettingsScreen } from '@screens/SettingsScreen'
import { PostDetailScreen } from '@screens/PostDetailScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigator = () => {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: true,
                title: 'Profile'
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                headerShown: true,
                title: 'Settings'
              }}
            />
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={({ route }) => ({ 
                headerShown: true,
                title: route.params.title
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Tab Navigation with Icons

```typescript
// src/navigation/MainTabs.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from '@hooks/useTheme'
import Icon from 'react-native-vector-icons/Feather'
import { HomeScreen } from '@screens/HomeScreen'
import { SearchScreen } from '@screens/SearchScreen'
import { NotificationsScreen } from '@screens/NotificationsScreen'
import { ProfileScreen } from '@screens/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

export const MainTabs = () => {
  const { theme } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case 'Home':
              iconName = 'home'
              break
            case 'Search':
              iconName = 'search'
              break
            case 'Notifications':
              iconName = 'bell'
              break
            case 'Profile':
              iconName = 'user'
              break
            default:
              iconName = 'circle'
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline
        },
        headerStyle: {
          backgroundColor: theme.colors.surface
        },
        headerTintColor: theme.colors.onSurface
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  )
}
```

## 🎨 Theming and Styling

### Theme System

```typescript
// src/theme/types.ts
export interface Theme {
  colors: {
    primary: string
    onPrimary: string
    secondary: string
    onSecondary: string
    surface: string
    onSurface: string
    surfaceVariant: string
    onSurfaceVariant: string
    background: string
    onBackground: string
    outline: string
    error: string
    onError: string
    success: string
    warning: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  typography: {
    h1: TextStyle
    h2: TextStyle
    h3: TextStyle
    body1: TextStyle
    body2: TextStyle
    caption: TextStyle
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
    xl: number
  }
}

// src/theme/themes.ts
export const lightTheme: Theme = {
  colors: {
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    secondary: '#64748B',
    onSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    onSurface: '#1E293B',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#64748B',
    background: '#F8FAFC',
    onBackground: '#1E293B',
    outline: '#E2E8F0',
    error: '#EF4444',
    onError: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16
    }
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }
}

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    surface: '#1E293B',
    onSurface: '#F1F5F9',
    surfaceVariant: '#334155',
    onSurfaceVariant: '#94A3B8',
    background: '#0F172A',
    onBackground: '#F1F5F9',
    outline: '#475569'
  }
}

// src/hooks/useTheme.ts
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme, Theme } from '@theme/themes'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme')
      if (savedTheme) {
        setIsDark(savedTheme === 'dark')
      } else {
        // Use system theme
        setIsDark(Appearance.getColorScheme() === 'dark')
      }
    } catch (error) {
      setIsDark(Appearance.getColorScheme() === 'dark')
    }
  }

  const toggleTheme = async () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const setTheme = async (newIsDark: boolean) => {
    setIsDark(newIsDark)
    await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

## 📱 Platform-Specific Code

### Platform Detection and Adaptation

```typescript
// src/utils/platform.ts
import { Platform, Dimensions } from 'react-native'

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export const isTablet = () => {
  const { width, height } = Dimensions.get('window')
  const aspectRatio = height / width
  
  // iPad-like aspect ratios
  return (width >= 600 && aspectRatio < 1.6) || (height >= 600 && aspectRatio > 0.6)
}

export const getStatusBarHeight = () => {
  if (isIOS) {
    // iOS safe area handling
    return 44 // Default for iPhones with notch
  }
  return 24 // Android status bar height
}

// src/components/PlatformView/PlatformView.tsx
import React from 'react'
import { View, ViewProps, Platform } from 'react-native'

interface PlatformViewProps extends ViewProps {
  ios?: ViewProps
  android?: ViewProps
}

export const PlatformView: React.FC<PlatformViewProps> = ({
  children,
  ios,
  android,
  ...commonProps
}) => {
  const platformProps = Platform.select({
    ios: ios || {},
    android: android || {}
  })

  return (
    <View {...commonProps} {...platformProps}>
      {children}
    </View>
  )
}

// Usage
<PlatformView
  style={styles.container}
  ios={{
    style: [styles.container, styles.iosSpecific]
  }}
  android={{
    style: [styles.container, styles.androidSpecific]
  }}
>
  <Text>Platform-specific styling</Text>
</PlatformView>
```

### Native Module Integration

```typescript
// src/services/BiometricsService.ts
import { NativeModules, Platform } from 'react-native'
import TouchID from 'react-native-touch-id'
import ReactNativeBiometrics from 'react-native-biometrics'

export class BiometricsService {
  private static rnBiometrics = new ReactNativeBiometrics()

  static async isSupported(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await TouchID.isSupported()
      } else {
        const { available } = await this.rnBiometrics.isSensorAvailable()
        return available
      }
    } catch (error) {
      return false
    }
  }

  static async getSupportedBiometryType(): Promise<string | null> {
    try {
      if (Platform.OS === 'ios') {
        return await TouchID.isSupported()
      } else {
        const { biometryType } = await this.rnBiometrics.isSensorAvailable()
        return biometryType
      }
    } catch (error) {
      return null
    }
  }

  static async authenticate(reason: string = 'Please verify your identity'): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        await TouchID.authenticate(reason, {
          fallbackLabel: 'Use Passcode',
          unifiedErrors: false,
          passcodeFallback: true
        })
        return true
      } else {
        const { success } = await this.rnBiometrics.simplePrompt({
          promptMessage: reason,
          cancelButtonText: 'Cancel'
        })
        return success
      }
    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error.message}`)
    }
  }

  static async createKeys(): Promise<{ publicKey: string } | null> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist()
      
      if (!keysExist) {
        const { publicKey } = await this.rnBiometrics.createKeys()
        return { publicKey }
      }
      
      return null
    } catch (error) {
      throw new Error(`Failed to create biometric keys: ${error.message}`)
    }
  }

  static async createSignature(payload: string): Promise<{ signature: string }> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: 'Please verify your identity',
        payload
      })

      if (!success) {
        throw new Error('Signature creation cancelled')
      }

      return { signature }
    } catch (error) {
      throw new Error(`Failed to create signature: ${error.message}`)
    }
  }
}
```

## 🔄 State Management with Redux Toolkit

### Store Configuration

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { userSlice } from './slices/userSlice'
import { postsSlice } from './slices/postsSlice'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'] // Only persist auth state
}

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  user: userSlice.reducer,
  posts: postsSlice.reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthService } from '@services/AuthService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await AuthService.login(email, password)
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  }
})

export const { clearError, setUser } = authSlice.actions
```

## 📚 Key Takeaways

1. **TypeScript First**: Strong typing for better development experience
2. **Component Architecture**: Reusable, well-tested components
3. **Navigation Excellence**: Type-safe navigation with React Navigation
4. **Platform Optimization**: Platform-specific code and optimizations
5. **State Management**: Redux Toolkit for scalable state management
6. **Native Integration**: Seamless native module integration

---

**Next**: [Native iOS Development →](native-ios.md)