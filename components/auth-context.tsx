"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, login as apiLogin, register as apiRegister, logout as apiLogout } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Validate the user object to ensure it has the required properties
        if (
          typeof parsedUser === "object" &&
          parsedUser !== null &&
          typeof parsedUser.id === "number" &&
          typeof parsedUser.name === "string" &&
          typeof parsedUser.phone === "string"
        ) {
          setUser(parsedUser)
        } else {
          console.error("Invalid user data format in localStorage")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (identifier: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Attempting login with identifier:", identifier)
      const userData = await apiLogin(identifier, password)
      console.log("Login successful, user data:", userData)

      // Validate the user data before setting it
      if (
        typeof userData === "object" &&
        userData !== null &&
        typeof userData.id === "number" &&
        typeof userData.name === "string" &&
        typeof userData.phone === "string"
      ) {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        })
        router.push("/")
      } else {
        console.error("Invalid user data structure:", userData)
        throw new Error("Invalid user data received from API")
      }
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, phone: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Registering user:", name, phone)
      const userData = await apiRegister(name, phone, password)

      // Validate the user data before setting it
      if (
        typeof userData === "object" &&
        userData !== null &&
        typeof userData.id === "number" &&
        typeof userData.name === "string" &&
        typeof userData.phone === "string"
      ) {
        console.log("Registration successful, user data:", userData)
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        toast({
          title: "Registration successful",
          description: `Welcome, ${userData.name}!`,
        })
        router.push("/my-tickets")
      } else {
        console.error("Invalid user data received from API:", userData)
        throw new Error(
          `Invalid user data received from API. Expected object with id, name, and phone, got: ${JSON.stringify(userData)}`
        )
      }
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      if (user?.token) {
        await apiLogout(user.token)
      }
      setUser(null)
      localStorage.removeItem("user")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
