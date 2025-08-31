# 🟢 Vue.js Progressive Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Vue 3 Composition API and Modern Patterns*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for Vue.js insights and best practices

---

## Overview

Vue.js embodies progressive enhancement—start simple, add complexity as needed. This guide covers **Vue 3 Composition API**, modern patterns, and **Context Engineering** methodology for building maintainable, scalable Vue applications.

## 🚀 Vue 3 Composition API Mastery

### Setup Script and Composition API

```vue
<template>
  <div class="user-profile">
    <LoadingSpinner v-if="loading" />
    <UserCard v-else :user="user" @update="handleUpdate" />
    <UserStats :stats="userStats" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUser } from '@/composables/useUser'
import { useUserStats } from '@/composables/useUserStats'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// Composables for logic reuse
const { user, loading, fetchUser, updateUser } = useUser()
const { userStats } = useUserStats(() => user.value?.id)

// Local reactive state
const isEditing = ref(false)

// Computed properties
const displayName = computed(() => 
  user.value ? `${user.value.name} (${user.value.email})` : 'Loading...'
)

// Event handlers
const handleUpdate = async (updatedUser: Partial<User>) => {
  await updateUser(updatedUser)
  isEditing.value = false
}

// Lifecycle
onMounted(() => {
  fetchUser()
})
</script>
```

### Advanced Composables Pattern

```typescript
// composables/useUser.ts
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'

export function useUser() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!user.value)
  
  const fetchUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      user.value = await userApi.getUser(id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user.value) return
    
    try {
      loading.value = true
      user.value = await userApi.updateUser(user.value.id, updates)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isLoggedIn,
    fetchUser,
    updateUser
  }
}
```

## 🗃️ State Management with Pinia

### Store Definition

```typescript
// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

  // Getters
  const getUserById = computed(() => 
    (id: number) => users.value.find(user => user.id === id)
  )

  const totalUsers = computed(() => users.value.length)

  // Actions
  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await userApi.getUsers()
    } finally {
      loading.value = false
    }
  }

  function addUser(user: User) {
    users.value.push(user)
  }

  function removeUser(id: number) {
    const index = users.value.findIndex(user => user.id === id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }

  return {
    // State
    users,
    currentUser,
    loading,
    // Getters
    getUserById,
    totalUsers,
    // Actions
    fetchUsers,
    addUser,
    removeUser
  }
})
```

### Using Stores in Components

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const { users, loading, totalUsers } = storeToRefs(userStore)
const { fetchUsers, addUser } = userStore

onMounted(() => {
  fetchUsers()
})
</script>
```

## 🧩 Advanced Component Patterns

### Compound Components with Slots

```vue
<!-- DataTable.vue -->
<template>
  <div class="data-table">
    <div class="data-table__header">
      <slot name="header" :total="items.length" />
    </div>
    
    <div class="data-table__body">
      <div
        v-for="item in paginatedItems"
        :key="item.id"
        class="data-table__row"
      >
        <slot name="row" :item="item" :index="index" />
      </div>
    </div>
    
    <div class="data-table__footer">
      <slot name="footer" :pagination="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  items: any[]
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10
})

const currentPage = ref(1)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.items.slice(start, start + props.pageSize)
})

const pagination = computed(() => ({
  currentPage: currentPage.value,
  totalPages: Math.ceil(props.items.length / props.pageSize),
  hasNext: currentPage.value < Math.ceil(props.items.length / props.pageSize),
  hasPrev: currentPage.value > 1
}))
</script>
```

### Usage with Scoped Slots

```vue
<template>
  <DataTable :items="users" :page-size="5">
    <template #header="{ total }">
      <h2>Users ({{ total }})</h2>
      <button @click="addNewUser">Add User</button>
    </template>
    
    <template #row="{ item: user }">
      <UserRow :user="user" @edit="editUser" @delete="deleteUser" />
    </template>
    
    <template #footer="{ pagination }">
      <Pagination v-model="pagination.currentPage" :total-pages="pagination.totalPages" />
    </template>
  </DataTable>
</template>
```

## 🚦 Vue Router 4 Advanced Patterns

### Route-Level Code Splitting

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    children: [
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/UserDetail.vue'),
        props: route => ({ id: Number(route.params.id) })
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' })
  } else {
    next()
  }
})
```

### Route Composition with useRouter

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Reactive route params
const userId = computed(() => Number(route.params.id))

// Programmatic navigation
const goToUser = (id: number) => {
  router.push({ name: 'UserDetail', params: { id } })
}

// Query parameters
const searchQuery = computed({
  get: () => route.query.search as string || '',
  set: (value) => {
    router.replace({ 
      query: { ...route.query, search: value || undefined }
    })
  }
})
</script>
```

## 🎨 Modern Styling Approaches

### CSS Modules with Vue

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">Vue Component</h1>
    <button :class="[$style.button, $style.primary]">
      Click me
    </button>
  </div>
</template>

<style module>
.container {
  padding: 1rem;
  background: var(--bg-color);
}

.title {
  font-size: 2rem;
  color: var(--text-color);
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  
  &.primary {
    background: var(--primary-color);
    color: white;
  }
}
</style>
```

## 🧪 Testing Vue Applications

### Component Testing with Vue Testing Library

```typescript
// UserCard.test.ts
import { render, screen, fireEvent } from '@testing-library/vue'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('renders user information', () => {
    render(UserCard, {
      props: { user: mockUser }
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('emits update event when edit button is clicked', async () => {
    const { emitted } = render(UserCard, {
      props: { user: mockUser }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(emitted().update).toHaveLength(1)
    expect(emitted().update[0]).toEqual([mockUser])
  })
})
```

### Composable Testing

```typescript
// useUser.test.ts
import { renderComposition } from '@testing-library/vue'
import { useUser } from '@/composables/useUser'

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderComposition(() => useUser())

    expect(result.loading.value).toBe(false)
    expect(result.user.value).toBeNull()

    await result.fetchUser(1)

    expect(result.user.value).toEqual(mockUser)
    expect(result.loading.value).toBe(false)
  })
})
```

## 🔧 Context Engineering for Vue

### System Context Template

```markdown
# Vue.js Application Context Template

## System Context Layer
- Expert Vue.js Developer with Composition API mastery
- Progressive enhancement philosophy
- Component-based architecture focus
- TypeScript integration specialist

## Domain Context Layer
- Technology Stack: Vue 3, TypeScript, Vite
- State Management: Pinia or Vuex 4
- Routing: Vue Router 4
- UI Framework: Vuetify, Quasar, or custom
- Testing: Vitest + Vue Testing Library

## Task Context Layer
- Feature requirements and user stories
- Progressive Web App requirements
- SEO and performance requirements
- Accessibility standards (WCAG 2.1)
```

### Project Structure Template

```
src/
├── components/           # Reusable components
│   ├── base/            # Base components (Button, Input, etc.)
│   ├── layout/          # Layout components
│   └── feature/         # Feature-specific components
├── composables/         # Reusable composition functions
├── stores/              # Pinia stores
├── views/               # Page components
├── router/              # Route definitions
├── api/                 # API layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── assets/              # Static assets
```

## 🚀 Performance Optimization

### Lazy Loading and Code Splitting

```vue
<template>
  <div>
    <Suspense>
      <template #default>
        <HeavyComponent v-if="showHeavy" />
      </template>
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
</script>
```

### Virtual Scrolling for Large Lists

```vue
<template>
  <VirtualList
    :items="items"
    :item-height="50"
    :container-height="400"
    v-slot="{ item, index }"
  >
    <ListItem :item="item" :index="index" />
  </VirtualList>
</template>
```

## 📚 Key Takeaways

1. **Composition API First**: Use composition functions for reusable logic
2. **Progressive Enhancement**: Start simple, add complexity as needed
3. **TypeScript Integration**: Leverage strong typing for better DX
4. **Performance by Default**: Use built-in optimization patterns
5. **Testing Excellence**: Test components and composables thoroughly

---

**Next**: [Angular Enterprise Architecture →](03-angular.md)