import { reactive, toRef } from 'vue'

export interface User {
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const state = reactive<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false
})

// Initialize from localStorage/sessionStorage
const initializeAuth = () => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User
      state.token = token
      state.user = user
      state.isAuthenticated = true
    } catch (error) {
      console.error('Failed to parse user data:', error)
      // Clear invalid data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
      state.user = null
      state.token = null
      state.isAuthenticated = false
    }
  }
}

export const useAuthStore = () => {
  const login = (user: User, token: string, rememberMe: boolean = false) => {
    state.user = user
    state.token = token
    state.isAuthenticated = true
    
    // Store in appropriate storage
    localStorage.setItem('token', token)
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('user', JSON.stringify(user))
    }
  }

  const logout = () => {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    
    // Clear storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
  }

  const updateUser = (user: User) => {
    state.user = user
    
    // Update storage
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userStr) {
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(user))
    }
  }

  return {
    // Readonly state using toRef for proper typing
    user: toRef(state, 'user'),
    token: toRef(state, 'token'),
    isAuthenticated: toRef(state, 'isAuthenticated'),
    
    // Actions
    login,
    logout,
    updateUser,
    initializeAuth
  }
}

// Initialize auth on module load
initializeAuth() 