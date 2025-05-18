"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/components/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Extract user name safely
  const userName =
    user && typeof user === "object" && user !== null && typeof user.name === "string" ? user.name : "User"

  // Format wallet balance with commas
  const formatBalance = (balance: number | undefined): string => {
    if (balance === undefined) return "0"
    return balance.toLocaleString()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold text-purple-700">
            PlatinumList
          </Link>
          <span className="text-sm text-gray-500">Dubai</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-purple-700">
            Events
          </Link>
          {/* Only show wallet link if user is logged in */}
          {user && (
            <>
              <Link href="/wallet" className="text-sm font-medium hover:text-purple-700 flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                Wallet ({formatBalance(user.wallet_balance)})
              </Link>
              <Link href="/my-tickets" className="text-sm font-medium hover:text-purple-700 flex items-center">
                My Tickets
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {userName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/wallet">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet ({formatBalance(user.wallet_balance)})
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-tickets">My Tickets</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <AuthModal
                trigger={
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                }
              />
              <AuthModal
                trigger={
                  <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                    Register
                  </Button>
                }
                defaultTab="register"
              />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-purple-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>

            {user && (
              <>
                <Link
                  href="/wallet"
                  className="text-sm font-medium hover:text-purple-700 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wallet className="h-4 w-4 mr-1" />
                  Wallet ({formatBalance(user.wallet_balance)})
                </Link>
                <Link
                  href="/my-tickets"
                  className="text-sm font-medium hover:text-purple-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tickets
                </Link>
              </>
            )}

            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
              >
                Logout
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <AuthModal
                  trigger={
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  }
                  onSuccess={() => setMobileMenuOpen(false)}
                />
                <AuthModal
                  trigger={
                    <Button size="sm" className="w-full bg-purple-700 hover:bg-purple-800">
                      Register
                    </Button>
                  }
                  defaultTab="register"
                  onSuccess={() => setMobileMenuOpen(false)}
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
