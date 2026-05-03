import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from '@/context/auth-state'
import * as authApi from '@/lib/auth-api'
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  isTokenExpired,
  persistAuth,
} from '@/lib/auth-storage'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'

type AuthState = {
  user: User | null
  token: string | null
}

function getInitialAuthState(): AuthState {
  const storedToken = getStoredToken()
  const storedUser = getStoredUser()

  if (storedToken && storedUser && !isTokenExpired(storedToken)) {
    return { token: storedToken, user: storedUser }
  }

  if (storedToken) {
    clearAuth()
  }

  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState)

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    persistAuth(response.token, response.user)
    setAuthState({ token: response.token, user: response.user })
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload)
    persistAuth(response.token, response.user)
    setAuthState({ token: response.token, user: response.user })
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setAuthState({ token: null, user: null })
  }, [])

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token && authState.user),
      isInitializing: false,
      login,
      register,
      logout,
    }),
    [authState.token, authState.user, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
