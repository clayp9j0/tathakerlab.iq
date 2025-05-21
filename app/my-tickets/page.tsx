"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { PurchasedTicket } from "@/lib/types"
import { PurchasedTicketCard } from "@/components/tickets/PurchasedTicketCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blue-penguin-872241.hostingersite.com"

export default function MyTicketsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<PurchasedTicket[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'used' | 'cancelled'>('all');
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
 ticketHolderName: apiTicket.holder_name || 'N/A',
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

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus === 'all') {
 return true;
    }
    if (filterStatus === 'available') {
      return ticket.availability_status === 'available';

    }
    // Map 'used' and 'cancelled' to their availability status
    return ticket.availability_status === filterStatus;
  });

  if (isLoading || isLoadingTickets) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Tickets</h1>
 <Button onClick={() => router.push("/")}
 className='bg-[#7D2EEB] text-white hover:bg-[#6b29d6]'
 >Browse Events</Button>
        </div>
        {/* Filter Buttons */}
        <div className="mb-6 flex space-x-4">
          <Button
            className={filterStatus === 'all' ? 'bg-[#7D2EEB] text-white hover:bg-[#6b29d6]' : 'border'}
            onClick={() => setFilterStatus('all')}
          >All</Button>
          <Button
            variant={filterStatus === 'available' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('available')}
          >Ready to Use</Button>
          <Button
            variant={filterStatus === 'used' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('used')}
          >Used</Button>
          <Button
            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('cancelled')}>Cancelled</Button>

   </div>

        {tickets.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
   <h3 className="mb-2 text-xl font-semibold">No tickets found</h3>
            <p className="mb-4 text-muted-foreground">
              You haven't purchased any tickets yet.
            </p>
            <Button onClick={() => router.push("/")}>Browse Events</Button>
          </div>
        ) : (
          <div className="grid gap-1 md:grid-cols-3 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <PurchasedTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
