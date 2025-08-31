# 🅰️ Angular Enterprise Architecture

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *TypeScript-First Enterprise Development*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for Angular insights and best practices

---

## Overview

Angular is the enterprise-first framework built for large-scale applications. This guide covers **Angular 15+ features**, advanced patterns, **TypeScript excellence**, and **Context Engineering** methodology for building robust, scalable enterprise applications.

## 🚀 Angular 15+ Modern Features

### Standalone Components

```typescript
// user-profile.component.ts
import { Component, Input, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { UserService } from '../services/user.service'

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="user-profile-card">
      <mat-card-header>
        <mat-card-title>{{ user?.name }}</mat-card-title>
        <mat-card-subtitle>{{ user?.email }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="user-stats">
          <div class="stat">
            <span class="label">Projects:</span>
            <span class="value">{{ user?.projectCount || 0 }}</span>
          </div>
          <div class="stat">
            <span class="label">Last Active:</span>
            <span class="value">{{ user?.lastActive | date:'short' }}</span>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button (click)="editUser()">Edit</button>
        <button mat-button color="warn" (click)="deleteUser()">Delete</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  @Input() user: User | null = null
  
  private userService = inject(UserService)
  
  editUser(): void {
    if (this.user) {
      // Navigate to edit form or open dialog
      console.log('Editing user:', this.user.id)
    }
  }
  
  deleteUser(): void {
    if (this.user && confirm('Delete this user?')) {
      this.userService.deleteUser(this.user.id).subscribe()
    }
  }
}
```

### Angular Signals (Preview)

```typescript
// user-state.service.ts
import { Injectable, signal, computed } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  // Signals for reactive state
  private users = signal<User[]>([])
  private loading = signal(false)
  private filter = signal('')
  
  // Computed signals
  readonly filteredUsers = computed(() => {
    const filterValue = this.filter().toLowerCase()
    return this.users().filter(user => 
      user.name.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue)
    )
  })
  
  readonly userCount = computed(() => this.users().length)
  readonly isLoading = computed(() => this.loading())
  
  // Actions
  setUsers(users: User[]): void {
    this.users.set(users)
  }
  
  addUser(user: User): void {
    this.users.update(current => [...current, user])
  }
  
  setFilter(filter: string): void {
    this.filter.set(filter)
  }
  
  setLoading(loading: boolean): void {
    this.loading.set(loading)
  }
}
```

## 🏗️ Enterprise Architecture Patterns

### Feature Module Structure

```typescript
// user-management/user-management.module.ts
@NgModule({
  declarations: [
    UserListComponent,
    UserDetailComponent,
    UserFormComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  providers: [
    UserService,
    UserResolver,
    UserGuard
  ]
})
export class UserManagementModule { }
```

### Lazy Loading with Route Guards

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  }
]

// auth.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/login'])
    }
    
    const requiredRoles = route.data['roles'] as string[]
    if (requiredRoles && !this.auth.hasAnyRole(requiredRoles)) {
      return this.router.createUrlTree(['/unauthorized'])
    }
    
    return true
  }
}
```

## 💉 Advanced Dependency Injection

### Hierarchical Injectors

```typescript
// app.module.ts
@NgModule({
  providers: [
    { provide: LoggerService, useClass: ProductionLoggerService },
    { provide: API_BASE_URL, useValue: environment.apiUrl }
  ]
})
export class AppModule { }

// feature.module.ts
@NgModule({
  providers: [
    { provide: LoggerService, useClass: FeatureLoggerService } // Overrides app-level
  ]
})
export class FeatureModule { }

// component with component-level providers
@Component({
  providers: [
    { provide: DataService, useClass: LocalDataService }
  ]
})
export class SpecialComponent { }
```

### Factory Providers and InjectionToken

```typescript
// config.tokens.ts
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config')
export const API_CONFIG = new InjectionToken<ApiConfig>('api.config')

// config.factory.ts
export function createApiConfig(appConfig: AppConfig): ApiConfig {
  return {
    baseUrl: appConfig.apiUrl,
    timeout: appConfig.timeout || 30000,
    retries: appConfig.retries || 3
  }
}

// app.module.ts
@NgModule({
  providers: [
    { provide: APP_CONFIG, useValue: environment.appConfig },
    {
      provide: API_CONFIG,
      useFactory: createApiConfig,
      deps: [APP_CONFIG]
    }
  ]
})
export class AppModule { }
```

## 🔄 Reactive Programming with RxJS

### Advanced Observable Patterns

```typescript
// user.service.ts
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = inject(API_BASE_URL)
  private http = inject(HttpClient)
  
  // Cache with refresh capability
  private usersSubject = new BehaviorSubject<User[]>([])
  public users$ = this.usersSubject.asObservable()
  
  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$ = this.loadingSubject.asObservable()
  
  // Error handling
  private errorSubject = new Subject<string>()
  public error$ = this.errorSubject.asObservable()
  
  getUsers(): Observable<User[]> {
    this.loadingSubject.next(true)
    
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(users => {
        this.usersSubject.next(users)
        this.loadingSubject.next(false)
      }),
      catchError(error => {
        this.errorSubject.next('Failed to load users')
        this.loadingSubject.next(false)
        return throwError(() => error)
      })
    )
  }
  
  getUserById(id: number): Observable<User> {
    return this.users$.pipe(
      map(users => users.find(user => user.id === id)),
      filter(user => !!user),
      switchMap(user => 
        user ? of(user) : this.fetchUserById(id)
      )
    )
  }
  
  searchUsers(query: string): Observable<User[]> {
    return this.users$.pipe(
      map(users => users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      ))
    )
  }
}
```

### Reactive Forms with Validation

```typescript
// user-form.component.ts
@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="userForm.get('name')?.hasError('required')">
          Name is required
        </mat-error>
        <mat-error *ngIf="userForm.get('name')?.hasError('minlength')">
          Name must be at least 2 characters
        </mat-error>
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email">
        <mat-error *ngIf="userForm.get('email')?.hasError('required')">
          Email is required
        </mat-error>
        <mat-error *ngIf="userForm.get('email')?.hasError('email')">
          Invalid email format
        </mat-error>
        <mat-error *ngIf="userForm.get('email')?.hasError('emailTaken')">
          Email is already taken
        </mat-error>
      </mat-form-field>
      
      <div formGroupName="address">
        <mat-form-field>
          <mat-label>Street</mat-label>
          <input matInput formControlName="street">
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>City</mat-label>
          <input matInput formControlName="city">
        </mat-form-field>
      </div>
      
      <button 
        mat-raised-button 
        color="primary" 
        type="submit"
        [disabled]="userForm.invalid || isSubmitting"
      >
        {{ isSubmitting ? 'Saving...' : 'Save User' }}
      </button>
    </form>
  `
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup
  isSubmitting = false
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private emailValidator: EmailValidatorService
  ) {}
  
  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', 
        [Validators.required, Validators.email],
        [this.emailValidator.validateEmailNotTaken()]
      ],
      address: this.fb.group({
        street: [''],
        city: ['']
      })
    })
    
    // Real-time validation feedback
    this.userForm.statusChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(status => {
      console.log('Form status:', status)
    })
  }
  
  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true
      
      this.userService.createUser(this.userForm.value).pipe(
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: (user) => {
          console.log('User created:', user)
          this.userForm.reset()
        },
        error: (error) => {
          console.error('Error creating user:', error)
        }
      })
    }
  }
}
```

## 🧪 Testing Angular Applications

### Component Testing with Angular Testing Library

```typescript
// user-profile.component.spec.ts
import { render, screen, fireEvent } from '@testing-library/angular'
import { UserProfileComponent } from './user-profile.component'

describe('UserProfileComponent', () => {
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    projectCount: 5,
    lastActive: new Date()
  }

  it('should display user information', async () => {
    await render(UserProfileComponent, {
      componentProperties: { user: mockUser }
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should call edit function when edit button is clicked', async () => {
    const component = await render(UserProfileComponent, {
      componentProperties: { user: mockUser }
    })

    const editSpy = jest.spyOn(component.fixture.componentInstance, 'editUser')

    fireEvent.click(screen.getByText('Edit'))

    expect(editSpy).toHaveBeenCalled()
  })
})
```

### Service Testing with HttpClientTestingModule

```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    service = TestBed.inject(UserService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should fetch users', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John', email: 'john@example.com' }
    ]

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers)
    })

    const req = httpMock.expectOne('/api/users')
    expect(req.request.method).toBe('GET')
    req.flush(mockUsers)
  })
})
```

## 🎯 State Management with NgRx

### Store Setup

```typescript
// user.state.ts
export interface UserState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
}

export const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null
}

// user.actions.ts
export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Select User': props<{ userId: number }>(),
    'Create User': props<{ user: Omit<User, 'id'> }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: string }>()
  }
})

// user.reducer.ts
export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user]
  }))
)

// user.effects.ts
@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map(users => UserActions.loadUsersSuccess({ users })),
          catchError(error => of(UserActions.loadUsersFailure({ 
            error: error.message 
          })))
        )
      )
    )
  )

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      switchMap(({ user }) =>
        this.userService.createUser(user).pipe(
          map(createdUser => UserActions.createUserSuccess({ user: createdUser })),
          catchError(error => of(UserActions.createUserFailure({ 
            error: error.message 
          })))
        )
      )
    )
  )

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
```

## 🔧 Context Engineering for Angular

### System Context Template

```markdown
# Angular Application Context Template

## System Context Layer
- Senior Angular Developer with enterprise experience
- TypeScript and RxJS expertise
- Scalable architecture focus
- Testing and quality assurance specialist

## Domain Context Layer
- Technology Stack: Angular 15+, TypeScript, Angular CLI
- State Management: NgRx or Akita
- UI Components: Angular Material or PrimeNG
- Testing: Jest + Angular Testing Library
- Build: Angular CLI with custom builders

## Task Context Layer
- Enterprise application requirements
- Scalability and maintainability needs
- Integration requirements with backend APIs
- Performance requirements (Core Web Vitals)
- Accessibility standards (WCAG 2.1)
```

### Project Structure Template

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   ├── shared/               # Shared components, directives, pipes
│   ├── features/             # Feature modules
│   │   ├── user-management/
│   │   ├── dashboard/
│   │   └── reports/
│   ├── layout/               # Layout components
│   └── store/                # NgRx store (if using)
├── assets/                   # Static assets
├── environments/             # Environment configurations
└── styles/                   # Global styles
```

## 🚀 Performance Optimization

### OnPush Change Detection

```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      <app-user-card [user]="user" (userUpdated)="onUserUpdated($event)"></app-user-card>
    </div>
  `
})
export class UserListComponent {
  @Input() users: User[] = []
  
  trackByUserId(index: number, user: User): number {
    return user.id
  }
  
  onUserUpdated(user: User): void {
    // Handle user update
  }
}
```

### Lazy Loading and Preloading

```typescript
// app-routing.module.ts
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    // Custom preloading strategy
    // preloadingStrategy: CustomPreloadingStrategy
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// custom-preloading.strategy.ts
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload if route has preload: true in data
    return route.data && route.data['preload'] ? load() : of(null)
  }
}
```

## 📚 Key Takeaways

1. **Enterprise-First**: Built for large-scale, maintainable applications
2. **TypeScript Excellence**: Leverage strong typing and advanced features
3. **Reactive Architecture**: RxJS-powered data flow and state management
4. **Dependency Injection**: Powerful DI system for modularity and testing
5. **Testing by Default**: Comprehensive testing tools and strategies

---

**Next**: [Vanilla JavaScript Excellence →](04-vanilla-js.md)