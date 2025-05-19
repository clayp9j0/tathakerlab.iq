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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)

  const router = useRouter()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/")
      return
    }

    const fetchWalletData = async () => {
      try {
        setIsLoading(true)

        // Always fetch from API to get the latest balance
        const walletBalance = await getWalletBalance(user.token || "")
        setBalance(walletBalance)
        
        // Update user context with new balance
        if (updateUser) {
          updateUser({ ...user, wallet_balance: walletBalance })
        }

        // Fetch transactions
        const walletTransactions = await getWalletTransactions(user.token || "")
        setTransactions(walletTransactions)
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
        toast({
          title: "Error",
          description: "Failed to load wallet data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [user, router, toast, updateUser])

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

        // Add transaction to list
        setTransactions((prev) => [
          {
            id: Date.now(),
            type: "deposit",
            amount: amount,
            date: new Date().toISOString(),
            description: "Wallet deposit",
          },
          ...prev,
        ])

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format amount with commas
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString()
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
                  <span className="text-3xl font-bold">{balance !== null ? formatAmount(balance) : "0"}</span>
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

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="deposits">Deposits</TabsTrigger>
                  <TabsTrigger value="purchases">Purchases</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded-full mr-4 ${
                                transaction.type === "deposit"
                                  ? "bg-green-100"
                                  : transaction.type === "refund"
                                    ? "bg-blue-100"
                                    : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "deposit" ? (
                                <ArrowUpRight
                                  className={`h-5 w-5 ${
                                    transaction.type === "deposit"
                                      ? "text-green-600"
                                      : transaction.type === "refund"
                                        ? "text-blue-600"
                                        : "text-red-600"
                                  }`}
                                />
                              ) : transaction.type === "refund" ? (
                                <ArrowUpRight className="h-5 w-5 text-blue-600" />
                              ) : (
                                <ArrowDownLeft className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.type === "deposit"
                                  ? "Deposit"
                                  : transaction.type === "refund"
                                    ? "Refund"
                                    : "Purchase"}
                              </p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                              <p className="text-sm text-gray-500">{transaction.description}</p>
                            </div>
                          </div>
                          <p
                            className={`font-bold ${
                              transaction.type === "deposit" || transaction.type === "refund"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}
                            {formatAmount(Math.abs(transaction.amount))}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transactions found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="deposits">
                  {transactions.filter((t) => t.type === "deposit" || t.type === "refund").length > 0 ? (
                    <div className="space-y-4">
                      {transactions
                        .filter((t) => t.type === "deposit" || t.type === "refund")
                        .map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center">
                              <div
                                className={`p-2 rounded-full mr-4 ${
                                  transaction.type === "deposit" ? "bg-green-100" : "bg-blue-100"
                                }`}
                              >
                                <ArrowUpRight
                                  className={`h-5 w-5 ${
                                    transaction.type === "deposit" ? "text-green-600" : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{transaction.type === "deposit" ? "Deposit" : "Refund"}</p>
                                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                                <p className="text-sm text-gray-500">{transaction.description}</p>
                              </div>
                            </div>
                            <p className="font-bold text-green-600">+{formatAmount(transaction.amount)}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No deposits found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="purchases">
                  {transactions.filter((t) => t.type === "purchase").length > 0 ? (
                    <div className="space-y-4">
                      {transactions
                        .filter((t) => t.type === "purchase")
                        .map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-red-100 rounded-full mr-4">
                                <ArrowDownLeft className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Purchase</p>
                                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                                <p className="text-sm text-gray-500">{transaction.description}</p>
                              </div>
                            </div>
                            <p className="font-bold text-red-600">-{formatAmount(Math.abs(transaction.amount))}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No purchases found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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
