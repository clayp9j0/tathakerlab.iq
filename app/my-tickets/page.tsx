"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, MapPin, Clock, QrCode, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-context"
import Header from "@/components/header"
import { getMyTickets } from "@/lib/api"

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to home');
      router.push("/")
      return
    }
    const fetchTickets = async () => {
      try {
        console.log('Fetching tickets for user:', user.id);
        console.log('User token:', user.token);
        
        if (!user?.token) {
          console.error('No authentication token available');
          throw new Error("No authentication token available")
        }
        
        const response = await getMyTickets(user.token)
        console.log('API raw response:', response);
        
        // Handle different response formats
        let ticketsData = [];
        if (Array.isArray(response)) {
          console.log('Response is an array');
          ticketsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          console.log('Response has data array');
          ticketsData = response.data;
        } else if (response.id) {
          console.log('Response is a single ticket');
          ticketsData = [response];
        } else {
          console.log('Unexpected response format:', response);
        }
        
        console.log('Processed tickets data:', ticketsData);
        console.log('Number of tickets:', ticketsData.length);
        
        if (!Array.isArray(ticketsData)) {
          console.error('Tickets data is not an array:', ticketsData);
          setTickets([]);
          return;
        }
        
        // Log each ticket's properties
        ticketsData.forEach((ticket, index) => {
          console.log(`Ticket ${index + 1}:`, {
            id: ticket.id,
            event_date: ticket.event_date,
            start_date: ticket.start_date,
            is_valid: ticket.is_valid,
            event_name: ticket.event_name,
            event_title: ticket.event_title,
            qr_code: ticket.qr_code,
            ticket_svg: ticket.ticket_svg
          });
        });
        
        setTickets(ticketsData);
        
        // For SVG tickets, we'll consider all valid tickets as active
        const active = ticketsData.filter((ticket) => {
          const isValid = ticket.is_valid === 1;
          console.log('Ticket validation:', {
            ticketId: ticket.id,
            is_valid: ticket.is_valid,
            isValid: isValid
          });
          return isValid;
        });
        
        const past = ticketsData.filter((ticket) => {
          const isValid = ticket.is_valid === 0;
          console.log('Past ticket validation:', {
            ticketId: ticket.id,
            is_valid: ticket.is_valid,
            isValid: isValid
          });
          return isValid;
        });
        
        console.log('Active tickets:', active);
        console.log('Past tickets:', past);
      } catch (error) {
        console.error("Failed to fetch tickets:", error)
        setTickets([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchTickets()
  }, [user, router])

  // Ensure tickets is an array before filtering
  const activeTickets = Array.isArray(tickets) ? tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date || ticket.start_date);
    return eventDate > new Date() && ticket.is_valid === 1;
  }) : [];
  
  const pastTickets = Array.isArray(tickets) ? tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date || ticket.start_date);
    return eventDate <= new Date() || ticket.is_valid === 0;
  }) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white border rounded-lg p-6">
                <div className="h-6 bg-gray-200 w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 w-1/2 mb-6"></div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="h-40 bg-gray-200 w-full md:w-1/3 rounded-lg"></div>
                  <div className="w-full md:w-2/3 space-y-2">
                    <div className="h-4 bg-gray-200 w-full"></div>
                    <div className="h-4 bg-gray-200 w-3/4"></div>
                    <div className="h-4 bg-gray-200 w-1/2"></div>
                    <div className="h-10 bg-gray-200 w-1/3 mt-4 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Tickets ({activeTickets.length})</TabsTrigger>
            <TabsTrigger value="past">Past Tickets ({pastTickets.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            {activeTickets.length > 0 ? (
              <div className="space-y-6">
                {activeTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{ticket.event_name || ticket.event_title}</h2>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Valid
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 flex justify-center">
                          <div className="bg-white p-4 border rounded-lg inline-block shadow-sm">
                            {ticket.ticket_svg ? (
                              <div 
                                className="w-40 h-40"
                                dangerouslySetInnerHTML={{ __html: ticket.ticket_svg }}
                              />
                            ) : (
                              <img
                                src={ticket.qr_code || "/placeholder.svg"}
                                alt="Ticket QR Code"
                                className="w-40 h-40"
                              />
                            )}
                            <p className="text-center text-sm text-gray-500 mt-2">Scan at the venue</p>
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-gray-500">Ticket Type</p>
                              <p className="font-medium text-gray-900">{ticket.ticket_category || ticket.ticket_category_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ticket Price</p>
                              <p className="font-medium text-gray-900">{ticket.ticket_price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ticket Holder</p>
                              <p className="font-medium text-gray-900">{ticket.holder_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone Number</p>
                              <p className="font-medium text-gray-900">{ticket.holder_phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Event Date</p>
                              <p className="font-medium text-gray-900">{new Date(ticket.event_date || ticket.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ticket Number</p>
                              <p className="font-medium text-gray-900">{ticket.ticket_number || `TICKET-${ticket.id}`}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                              <Download className="h-4 w-4 mr-2" />
                              Download Ticket
                            </Button>
                            <Button variant="outline" className="border-purple-700 text-purple-700 hover:bg-purple-50">
                              <QrCode className="h-4 w-4 mr-2" />
                              View Full Ticket
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No Active Tickets</h3>
                <p className="text-gray-600 mb-6">You don't have any upcoming events.</p>
                <Button onClick={() => router.push("/")} className="bg-purple-700 hover:bg-purple-800">
                  Browse Events
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {pastTickets.length > 0 ? (
              <div className="space-y-6">
                {pastTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border rounded-lg overflow-hidden shadow-sm opacity-75">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold">{ticket.event_name || ticket.event_title}</h2>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full uppercase">
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 flex justify-center">
                          <div className="bg-white p-4 border rounded-lg inline-block">
                            {ticket.ticket_svg ? (
                              <div 
                                className="w-40 h-40"
                                dangerouslySetInnerHTML={{ __html: ticket.ticket_svg }}
                              />
                            ) : (
                              <img
                                src={ticket.qr_code || "/placeholder.svg"}
                                alt="Ticket QR Code"
                                className="w-40 h-40"
                              />
                            )}
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Ticket Type</p>
                              <p className="font-medium">{ticket.ticket_category || ticket.ticket_category_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ticket Price</p>
                              <p className="font-medium">{ticket.ticket_price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ticket Holder</p>
                              <p className="font-medium">{ticket.holder_name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No Past Tickets</h3>
                <p className="text-gray-600">You haven't attended any events yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-gray-100 border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">© 2024 PlatinumList. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
