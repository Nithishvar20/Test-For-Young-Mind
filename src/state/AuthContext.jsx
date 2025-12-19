// src/state/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'sp_user'
const LEADERBOARD_KEY = 'sp_leaderboard'

// default empty user shape
const emptyUser = null

const AuthContext = createContext({
  user: emptyUser,
  login: () => Promise.resolve(),
  logout: () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : emptyUser
    } catch (e) {
      return emptyUser
    }
  })

  // persist user to sessionStorage
  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch (e) { /* ignore */ }
  }, [user])

  // login(payload) — payload should include { name, school, place }
  const login = useCallback(async (payload = {}) => {
    // basic validation
    if (!payload || !payload.name) {
      console.warn('AuthContext.login called without name')
      return
    }

    const normalized = {
      id: payload.id || `u_${Date.now()}`,
      name: String(payload.name).trim(),
      school: String(payload.school || '').trim(),
      place: String(payload.place || '').trim()
    }

    // create minimal user object
    const newUser = {
      ...normalized,
      // additional optional fields:
      loggedAt: new Date().toISOString()
    }

    // persist to state and sessionStorage via effect above
    setUser(newUser)

    // Optionally ensure user appears in leaderboard storage (initial entry)
    try {
      const raw = sessionStorage.getItem(LEADERBOARD_KEY)
      let board = []
      if (raw) {
        board = JSON.parse(raw)
        if (!Array.isArray(board)) board = []
      }

      // if no entry for this user, add a placeholder record with score 0
      const already = board.find(b => b.name && b.name.toLowerCase() === newUser.name.toLowerCase())
      if (!already) {
        board.push({
          id: newUser.id,
          name: newUser.name,
          school: newUser.school,
          place: newUser.place,
          score: 0,
          date: new Date().toISOString(),
          played: 0,
          best: 0,
          total: 0,
          streak: 0,
          recent: []
        })
        sessionStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board))
      }
    } catch (e) {
      // ignore
    }

    console.info('AuthProvider: logged in ', newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try { sessionStorage.removeItem(STORAGE_KEY) } catch (e) {}
    console.info('AuthProvider: logged out')
  }, [])

  const value = { user, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// hook for consumers
export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext