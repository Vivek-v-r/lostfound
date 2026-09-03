import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      API.get('/api/auth/me/')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await API.post('/api/auth/login/', { email, password })
    localStorage.setItem('token', data.access_token)
    setUser({ id: data.user_id, name: data.name, email: data.email, role: data.role })
    return data
  }

  const register = async (payload) => {
    const { data } = await API.post('/api/auth/register/', payload)
    localStorage.setItem('token', data.access_token)
    setUser({ id: data.user_id, name: data.name, email: data.email, role: data.role })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
