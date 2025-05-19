"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { PurchasedTicket } from "@/lib/types"
import { PurchasedTicketCard } from "@/components/tickets/PurchasedTicketCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blue-penguin-872241.hostingersite.com"

export default function MyTicketsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<PurchasedTicket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      fetchUserTickets()
    }
  }, [user, isLoading, router])

  const fetchUserTickets = async () => {
    try {
      setIsLoadingTickets(true)
      
      // Get token from user object instead of localStorage
      if (!user?.token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/api/my-tickets`, {
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          router.push("/login")
          return
        }
        throw new Error("Failed to fetch tickets")
      }

      const responseData = await response.json()
      const apiTickets = responseData.data || []

      // Map API tickets to our frontend format
      const mappedTickets = apiTickets.map((apiTicket: any) => ({
        id: apiTicket.id,
        eventId: apiTicket.order_id,
        eventTitle: apiTicket.event_name,
        eventDate: apiTicket.ticket_category?.sale_end_date || apiTicket.created_at,
        eventLocation: "Venue details not provided",
        eventImageUrl: "/placeholder-event.jpg",
        eventImageHint: apiTicket.event_name,
        ticketCategoryName: apiTicket.ticket_category?.name || "Standard",
        ticketHolderName: apiTicket.holder_name,
        purchaseDate: apiTicket.created_at,
        qrCodeUrl: apiTicket.qr_code_svg,
        is_valid: apiTicket.is_valid,
        ticket_number: apiTicket.ticket_number,
        holder_phone: apiTicket.holder_phone,
        availability_status: apiTicket.availability_status,
        ticket_category: apiTicket.ticket_category
      }))

      setTickets(mappedTickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error",
        description: "Failed to load your tickets. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingTickets(false)
    }
  }

  if (isLoading || isLoadingTickets) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Button onClick={() => router.push("/")}>Browse Events</Button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">No tickets found</h3>
          <p className="mb-4 text-muted-foreground">
            You haven't purchased any tickets yet.
          </p>
          <Button onClick={() => router.push("/")}>Browse Events</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <PurchasedTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
