"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CalendarDays, MapPin, Clock, Share2, Heart, Users, Wallet } from "lucide-react"
import { type Event, type Ticket, type Order, getEventById, sampleEvent, createOrder } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-context"
import { AuthModal } from "@/components/auth-modal"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({})
  const [ticketHolders, setTicketHolders] = useState<Ticket[]>([])
  const [totalPrice, setTotalPrice] = useState(0)

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log(`Fetching event with ID: ${params.id}`)
        setIsLoading(true)
        const response = await fetch(`/api/events/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch event details")
        }
        const data = await response.json()
        console.log("Event data:", JSON.stringify(data, null, 2))

        // Validate the event data
        if (typeof data === "object" && data !== null) {
          // Ensure the event data has the correct structure
          const formattedEvent = {
            ...data,
            title: data.event_name || data.title || "Untitled Event",
            description: data.description || "",
            image: data.image || "/placeholder.svg?height=600&width=1200",
            date: data.date || "TBD",
            time: data.time || "TBD",
            venue: data.venue || "TBD",
            location: data.location || "TBD",
            category: data.category || "Event",
            price: data.price || "TBD",
            featured: data.featured || false,
            ticket_categories: data.ticket_categories || []
          }
          setEvent(formattedEvent)
        } else {
          throw new Error("Invalid event data format")
        }
      } catch (err) {
        console.error("Failed to fetch event:", err)
        setError("Failed to load event details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  // Calculate total price whenever selected tickets change
  useEffect(() => {
    if (!event || !event.ticket_categories) return

    let total = 0
    event.ticket_categories.forEach((category) => {
      const quantity = selectedTickets[category.id] || 0
      total += category.price * quantity
    })

    setTotalPrice(total)
  }, [selectedTickets, event])

  const handleTicketQuantityChange = (categoryId: number, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [categoryId]: quantity,
    }))

    // Update ticket holders array based on selected quantities
    const updatedTicketHolders: Ticket[] = []

    // Get the category name and price
    const category = event?.ticket_categories?.find((cat) => cat.id === categoryId)
    const categoryName = category?.name || ""
    const categoryPrice = category?.price || 0

    Object.entries(selectedTickets).forEach(([catId, qty]) => {
      const currentCategoryId = Number.parseInt(catId)
      // Skip the category we're currently updating
      if (currentCategoryId === categoryId) return

      // Get the category details for this ticket type
      const currentCategory = event?.ticket_categories?.find((cat) => cat.id === currentCategoryId)
      const currentCategoryName = currentCategory?.name || ""
      const currentCategoryPrice = currentCategory?.price || 0

      // Keep existing ticket holders for this category
      const existingHolders = ticketHolders.filter((t) => t.ticket_category_id === currentCategoryId)

      // Add as many as we need up to the quantity
      for (let i = 0; i < qty; i++) {
        if (existingHolders[i]) {
          updatedTicketHolders.push(existingHolders[i])
        } else {
          updatedTicketHolders.push({
            ticket_category_id: currentCategoryId,
            ticket_category_name: currentCategoryName,
            ticket_price: currentCategoryPrice,
            holder_name: "",
            holder_phone: "",
          })
        }
      }
    })

    // Now add the updated category
    for (let i = 0; i < quantity; i++) {
      updatedTicketHolders.push({
        ticket_category_id: categoryId,
        ticket_category_name: categoryName,
        ticket_price: categoryPrice,
        holder_name: "",
        holder_phone: "",
      })
    }

    setTicketHolders(updatedTicketHolders)
  }

  const updateTicketHolder = (index: number, field: "holder_name" | "holder_phone", value: string) => {
    const updatedHolders = [...ticketHolders]
    updatedHolders[index] = {
      ...updatedHolders[index],
      [field]: value,
    }
    setTicketHolders(updatedHolders)
  }

  const handleProceedToCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive",
      })
      return
    }

    if (!event?.id) {
      toast({
        title: "Error",
        description: "Event information is missing.",
        variant: "destructive",
      })
      return
    }

    if (!user.token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      })
      return
    }

    // Validate ticket holders
    const isValid = ticketHolders.every(
      (ticket) => ticket.holder_name.trim() !== "" && ticket.holder_phone.trim() !== "",
    )

    if (!isValid) {
      toast({
        title: "Missing information",
        description: "Please fill in all ticket holder details.",
        variant: "destructive",
      })
      return
    }

    // Check if user has enough balance in wallet
    if (user.wallet_balance !== undefined && user.wallet_balance < totalPrice) {
      toast({
        title: "Insufficient funds",
        description: "Please top up your wallet to complete this purchase.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create the order
      const order: Order = {
        event_id: event.id,
        tickets: ticketHolders.map(ticket => ({
          ticket_category_id: ticket.ticket_category_id,
          holder_name: ticket.holder_name,
          holder_phone: ticket.holder_phone
        }))
      }

      const response = await createOrder(order, user.token)
      
      if (response.success) {
        // Update user's wallet balance
        if (user.wallet_balance !== undefined) {
          user.wallet_balance -= totalPrice
        }
        
        toast({
          title: "Order successful",
          description: "Your tickets have been purchased successfully.",
        })
        // Redirect to my tickets page
        router.push("/my-tickets")
      } else {
        throw new Error(response.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to create order. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format price with commas
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined || isNaN(Number(price)) || Number(price) === 0) {
      return "Free"
    }
    return Number(price).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 w-full mb-8 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-6 bg-gray-200 w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 w-full mb-2"></div>
                <div className="h-4 bg-gray-200 w-full mb-2"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-6"></div>
                <div className="h-6 bg-gray-200 w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 w-full mb-2"></div>
                <div className="h-4 bg-gray-200 w-full mb-2"></div>
              </div>
              <div>
                <div className="h-64 bg-gray-200 w-full rounded-lg mb-4"></div>
                <div className="h-10 bg-gray-200 w-full rounded mb-2"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Event not found</p>
            <Button onClick={() => router.push("/")}>Back to Events</Button>
          </div>
        </main>
      </div>
    )
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)
  const hasSelectedTickets = totalTickets > 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-2 items-center text-gray-600">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1 text-purple-700" />
              {event.date}
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-purple-700" />
              {event.time}
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-purple-700" />
              {typeof event.venue === "object" && event.venue !== null && typeof event.venue.name === "string"
                ? event.venue.name
                : typeof event.venue === "string"
                  ? event.venue
                  : "TBD"}
              , {typeof event.location === "string" ? event.location : "TBD"}
            </div>
          </div>
        </div>

        <div className="relative mb-8 rounded-lg overflow-hidden">
          <img
            src={event.image || "/placeholder.svg?height=600&width=1200"}
            alt={event.title}
            className="w-full h-[400px] object-cover"
          />
          {event.featured && <Badge className="absolute top-2 left-2 bg-purple-700">Featured</Badge>}
          <Badge className="absolute top-2 right-2 bg-gray-800">
            {typeof event.category === "object" && event.category !== null && typeof event.category.name === "string"
              ? event.category.name
              : typeof event.category === "string"
                ? event.category
                : "Event"}
          </Badge>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 hover:bg-white">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 hover:bg-white">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  <p className="mb-4">
                    {event.description ||
                      `Join us for an unforgettable experience at ${event.title}. This event promises to be one of the highlights of the year, featuring amazing performances and an incredible atmosphere.`}
                  </p>
                  <p className="mb-4">
                    Don't miss this opportunity to be part of something special. Tickets are selling fast, so secure
                    yours today!
                  </p>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Event Highlights</h3>
                  <ul className="list-disc pl-5 mb-4">
                    <li>World-class entertainment</li>
                    <li>Spectacular venue</li>
                    <li>Unforgettable experience</li>
                    <li>Perfect for all ages</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="venue" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Venue Information</h2>
                <div className="prose max-w-none">
                  <p className="mb-4">
                    {typeof event.venue === "object" && event.venue !== null && typeof event.venue.name === "string"
                      ? event.venue.name
                      : typeof event.venue === "string"
                        ? event.venue
                        : "TBD"}{" "}
                    is located in {typeof event.location === "string" ? event.location : "TBD"}. It's one of the premier
                    venues in Dubai, known for its excellent facilities and atmosphere.
                  </p>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Getting There</h3>
                  <p className="mb-4">
                    The venue is easily accessible by car and public transportation. Parking is available on-site.
                  </p>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Facilities</h3>
                  <ul className="list-disc pl-5 mb-4">
                    <li>Air-conditioned seating</li>
                    <li>Food and beverage outlets</li>
                    <li>Accessible entrances and seating</li>
                    <li>Clean restrooms</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">What time do doors open?</h3>
                    <p className="text-gray-600">Doors typically open 1 hour before the event start time.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is there an age restriction?</h3>
                    <p className="text-gray-600">
                      This depends on the specific event. Please check the event details for age restrictions.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can I get a refund if I can't attend?</h3>
                    <p className="text-gray-600">
                      Refunds are available up to 48 hours before the event. After that, tickets are non-refundable but
                      may be transferable.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">What items are prohibited?</h3>
                    <p className="text-gray-600">
                      Outside food and drinks, professional cameras, and recording equipment are typically not allowed.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Tickets</h2>

                {event.ticket_categories && event.ticket_categories.length > 0 ? (
                  <div className="space-y-4">
                    {event.ticket_categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-lg font-bold">{formatPrice(category.price)}</p>
                          <p className="text-sm text-gray-500">{category.available} tickets left</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTicketQuantityChange(
                                category.id,
                                Math.max(0, (selectedTickets[category.id] || 0) - 1),
                              )
                            }
                            disabled={(selectedTickets[category.id] || 0) === 0}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{selectedTickets[category.id] || 0}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTicketQuantityChange(category.id, (selectedTickets[category.id] || 0) + 1)
                            }
                            disabled={category.available <= (selectedTickets[category.id] || 0)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No tickets available at the moment.</p>
                )}

                {hasSelectedTickets && (
                  <div className="mt-6">
                    <div className="flex justify-between font-semibold mb-2">
                      <span>Total Tickets:</span>
                      <span>{totalTickets}</span>
                    </div>

                    <div className="flex justify-between font-semibold mb-4">
                      <span>Total Price:</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>

                    <h3 className="font-semibold mt-4 mb-2">Ticket Holder Information</h3>
                    <div className="space-y-4">
                      {ticketHolders.map((ticket, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <p className="text-sm font-medium mb-2">
                            Ticket {index + 1} - {ticket.ticket_category_name} - {formatPrice(ticket.ticket_price || 0)}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`name-${index}`}>Full Name</Label>
                              <Input
                                id={`name-${index}`}
                                value={ticket.holder_name}
                                onChange={(e) => updateTicketHolder(index, "holder_name", e.target.value)}
                                placeholder="Enter full name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                              <Input
                                id={`phone-${index}`}
                                value={ticket.holder_phone}
                                onChange={(e) => updateTicketHolder(index, "holder_phone", e.target.value)}
                                placeholder="Enter phone number"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Wallet className="h-5 w-5 mr-2 text-purple-700" />
                          <span className="font-medium">Wallet Balance:</span>
                        </div>
                        <span className="font-bold">{formatPrice(user.wallet_balance || 0)}</span>
                      </div>

                      <Button
                        className="w-full bg-purple-700 hover:bg-purple-800"
                        disabled={!hasSelectedTickets}
                        onClick={handleProceedToCheckout}
                      >
                        {hasSelectedTickets ? "Proceed to Checkout" : "Select Tickets"}
                      </Button>
                    </div>
                  ) : (
                    <AuthModal
                      trigger={
                        <Button className="w-full bg-purple-700 hover:bg-purple-800" disabled={!hasSelectedTickets}>
                          Sign in to Book
                        </Button>
                      }
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{Math.floor(Math.random() * 50) + 10} people viewing this event</span>
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
