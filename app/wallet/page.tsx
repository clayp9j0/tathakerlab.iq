"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { getWalletBalance, getWalletTransactions, depositToWallet } from "@/lib/api"

interface Transaction {
  id: number
  type: "deposit" | "purchase" | "refund"
  amount: number
  date: string
  description: string
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)

  const router = useRouter()
  const { user, updateUser, isLoading: isAuthLoading } = useAuth ? useAuth() : { user: null, updateUser: null, isLoading: false }
  const { toast } = useToast()

  useEffect(() => {
    console.log('[WalletPage] useEffect Dependencies:', { user, isAuthLoading, router, toast, updateUser });
    console.log('[WalletPage] useEffect - Start', { isAuthLoading, user });
    console.log('[WalletPage] useEffect fired. isAuthLoading:', isAuthLoading, 'user:', user)
    if (isAuthLoading) return; // Wait for auth to finish loading
    if (!user) {
      console.log('[WalletPage] No user detected, redirecting to /')
      router.push("/")
      return
    }

    const fetchWalletData = async () => {
      console.log('[WalletPage] fetchWalletData - Called', { isAuthLoading, user });
      try {
        setIsLoading(true)
        console.log('[WalletPage] Fetching wallet balance for user:', user)
        // Always fetch from API to get the latest balance
        const walletBalance = await getWalletBalance(user.token || "")
        setBalance(walletBalance)
        console.log('[WalletPage] Wallet balance fetched:', walletBalance)
        // Update user context with new balance
        if (updateUser) {
          updateUser({ ...user, wallet_balance: walletBalance })
        }
      } catch (error) {
        console.error("[WalletPage] Failed to fetch wallet data:", error)
        toast({
          title: "Error",
          description: "Failed to load wallet data. Please try again.",
          variant: "destructive",
        })
        // Set default values on error
        setBalance(0)
      } finally {
        setIsLoading(false)
        console.log('[WalletPage] setIsLoading(false) called')
      }
    }

    fetchWalletData()
  }, [isAuthLoading, router, toast, updateUser])

  const handleDeposit = async () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to deposit funds.",
        variant: "destructive",
      })
      return
    }

    const amount = Number(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDepositing(true)

      const result = await depositToWallet(String(user.id), amount, user.token || "")

      if (result.success) {
        // Fetch updated balance after deposit
        const newBalance = await getWalletBalance(user.token || "")
        setBalance(newBalance)
        
        // Update user context with new balance
        if (updateUser) {
          updateUser({ ...user, wallet_balance: newBalance })
        }

        // Clear input
        setDepositAmount("")

        toast({
          title: "Deposit successful",
          description: `${amount.toLocaleString()} has been added to your wallet.`,
        })
      } else {
        throw new Error(result.message || "Deposit failed")
      }
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit failed",
        description: error instanceof Error ? error.message : "An error occurred during deposit.",
        variant: "destructive",
      })
    } finally {
      setIsDepositing(false)
    }
  }

  // Format amount with commas
  const formatAmount = (amount: number): string => {
    // Convert number to string and add commas
    const parts = amount.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.') + ' IQD'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wallet Balance</CardTitle>
                <CardDescription>Your current available balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 mr-3 text-purple-700" />
                  <span className="text-3xl font-bold">{balance !== null ? formatAmount(balance) : "0"} IQD</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add Funds</CardTitle>
                <CardDescription>Top up your wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-purple-700 hover:bg-purple-800"
                    onClick={handleDeposit}
                    disabled={isDepositing}
                  >
                    {isDepositing ? (
                      <>
                        <span className="animate-spin mr-2">
                          <Clock className="h-4 w-4" />
                        </span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">© 2024 Tathaker Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
