# ⚛️ React Ecosystem Mastery

> *"Build exceptional React applications with Context Engineering precision"*

## 🎯 Overview

React 18+ development with **Context Engineering** methodology for scalable, performant applications.

## 📋 React Context Engineering Template

### System Context Layer
```markdown
## Role: Senior React Developer
- Expert in React 18+ patterns, TypeScript, performance optimization
- Focus on functional components, hooks, accessibility (WCAG 2.1 AA)
- Performance budget: FCP < 1.5s, bundle < 250kb

## Quality Standards
- TypeScript strict mode, 80%+ test coverage
- Zero React warnings, comprehensive error handling
- Follow React DevTools Profiler recommendations
```

### Domain Context Layer
```markdown
## Technology Stack
- React 18+ with TypeScript, Vite/Next.js
- State: Context API + useReducer, Redux Toolkit/Zustand
- Styling: Tailwind CSS with headless UI
- Data: React Query for server state
- Testing: Jest + React Testing Library + MSW

## Architecture Patterns
- Component composition over inheritance
- Custom hooks for reusable logic
- Compound components for complex UI
- Container/Presenter separation
```

---

## 🏗️ Core Patterns

### 1. Modern Component Architecture

```typescript
// ✅ TypeScript Component with Performance Optimization
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate
}) => {
  const { data: user, isLoading, error } = useUser(userId);

  const displayName = useMemo(() => 
    user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    [user]
  );

  const handleUpdate = useCallback((updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      onUpdate?.(updatedUser);
    }
  }, [user, onUpdate]);

  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <EmptyState message="User not found" />;

  return (
    <div className="user-profile">
      <Avatar src={user.avatar} alt={`${displayName} avatar`} />
      <UserDetails user={user} onUpdate={handleUpdate} />
    </div>
  );
};
```

### 2. Custom Hook Patterns

```typescript
// ✅ Custom Hook for API Data with Error Handling
export function useApiData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return { data, loading, error, refetch: fetchData };
}
```

### 3. State Management with Context

```typescript
// ✅ Context API with Reducer Pattern
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};
```

---

## 🚀 Performance Optimization

### React.memo and Memoization
```typescript
// ✅ Optimized Component with Custom Comparison
export const UserCard = React.memo<UserCardProps>(({ 
  user, 
  onSelect, 
  selected 
}) => {
  const handleClick = useCallback(() => onSelect(user), [onSelect, user]);
  
  return (
    <div className={clsx('user-card', { selected })} onClick={handleClick}>
      <Avatar src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
    </div>
  );
}, (prev, next) => 
  prev.user.id === next.user.id && 
  prev.selected === next.selected
);
```

### Code Splitting
```typescript
// ✅ Route-based Code Splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const UserManagement = lazy(() => import('./UserManagement'));

export const AppRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={
      <Suspense fallback={<PageSkeleton />}>
        <Dashboard />
      </Suspense>
    } />
  </Routes>
);
```

---

## 🧪 Testing Strategies

### Component Testing
```typescript
// ✅ React Testing Library Best Practices
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('UserProfile', () => {
  it('renders user data correctly', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile userId="1" />);
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const mockOnUpdate = jest.fn();
    
    render(<UserProfile userId="1" onUpdate={mockOnUpdate} />);
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.type(screen.getByDisplayValue('John'), ' Smith');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'John Smith' })
    );
  });
});
```

### Hook Testing
```typescript
// ✅ Testing Custom Hooks
import { renderHook, act } from '@testing-library/react';

describe('useApiData', () => {
  it('fetches and returns data', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });
    
    const { result } = renderHook(() => useApiData('test', mockFetcher));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 🔧 Development Setup

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  }
}
```

---

## 📊 Context Engineering Workflow

### 1. Requirements Analysis
```markdown
## React Project Discovery Questions

### Application Type
- SPA or MPA? (Default: SPA)
- Need SSR/SSG? (Default: CSR for dashboards, SSR for marketing)
- Target devices? (Default: Desktop + Mobile responsive)

### Performance Requirements
- Core Web Vitals targets? (Default: FCP < 1.5s, LCP < 2.5s)
- Bundle size constraints? (Default: < 250kb initial)
- Offline support needed? (Default: No)

### Team Context
- TypeScript experience? (Default: Yes)
- Preferred state management? (Default: Context API for simple, Redux for complex)
- Testing requirements? (Default: 80% coverage for business logic)
```

### 2. Architecture Decisions
- **State Management**: Context API → Redux Toolkit → Zustand
- **Styling**: Tailwind CSS → Styled Components → CSS Modules
- **Data Fetching**: React Query → SWR → Custom hooks
- **Routing**: React Router → Next.js Router → Reach Router

### 3. Performance Strategy
- Code splitting by routes and features
- Lazy loading for heavy components
- Memoization for expensive computations
- Virtual scrolling for large lists

---

## 📚 Essential Resources

### Documentation
- [React Docs](https://react.dev) - Official documentation
- [TypeScript + React](https://react-typescript-cheatsheet.netlify.app/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)

### Learning
- [React Patterns](https://reactpatterns.com/)
- [React Performance](https://web.dev/react-performance/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🎯 Quick Start Template

```bash
# Create new React project
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app

# Install dependencies
npm install @tanstack/react-query axios react-router-dom
npm install -D @testing-library/react @testing-library/user-event vitest

# Start development
npm run dev
```

---

**Next**: [Vue.js Progressive Development](02-vue.md) | **Up**: [Web Development](README.md)

*Last Updated: August 2025*