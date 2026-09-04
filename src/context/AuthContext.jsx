import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../lib/authApi'
import { setStoredToken, getStoredToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // true while we check for an existing session

  const hydrate = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { user, profile } = await authApi.me()
      setUser(user)
      setProfile(profile)
    } catch {
      // token invalid/expired — clear it silently
      setStoredToken(null)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const login = useCallback(async (email, password) => {
    const { token, user, profile } = await authApi.login({ email, password })
    setStoredToken(token)
    setUser(user)
    setProfile(profile)
    return user
  }, [])

  const registerStudent = useCallback(async (payload) => {
    const { token, user, profile } = await authApi.registerStudent(payload)
    setStoredToken(token)
    setUser(user)
    setProfile(profile)
    return user
  }, [])

  // Recruiters don't get a token until an admin approves them, so this
  // deliberately does NOT log the person in — see authController on the backend.
  const registerRecruiter = useCallback(async (payload) => {
    return authApi.registerRecruiter(payload)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore — we're clearing local state regardless
    }
    setStoredToken(null)
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const { user, profile } = await authApi.me()
    setUser(user)
    setProfile(profile)
  }, [])

  const value = {
    user,
    profile,
    role: user?.role || null,
    loading,
    isAuthenticated: Boolean(user),
    login,
    registerStudent,
    registerRecruiter,
    logout,
    refreshProfile,
    setProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
