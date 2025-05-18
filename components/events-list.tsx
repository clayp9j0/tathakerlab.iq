"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Event, getActiveEvents, getEventsByCategory } from "@/lib/api"
import Link from "next/link"

interface EventsListProps {
  categoryId?: number | string
  searchQuery?: string
  filters?: {
    date?: string
    priceMin?: number
    priceMax?: number
  }
}

export default function EventsList({ categoryId, searchQuery, filters }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch events based on category
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching events...", categoryId ? `for category: ${categoryId}` : "all events")

        let data: Event[]

        if (categoryId && categoryId !== "all") {
          // Convert categoryId to number if it's a string
          const catId = typeof categoryId === "string" ? Number.parseInt(categoryId, 10) : categoryId
          data = await getEventsByCategory(catId)
        } else {
          data = await getActiveEvents()
        }

        console.log(`Successfully fetched ${data.length} events`)
        setEvents(data)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [categoryId])

  // Apply search and filters
  useEffect(() => {
    if (events.length === 0) return

    let result = [...events]

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((event) => {
        const title = typeof event.title === "string" ? event.title.toLowerCase() : ""
        const venue =
          typeof event.venue === "string"
            ? event.venue.toLowerCase()
            : typeof event.venue === "object" && event.venue?.name
              ? event.venue.name.toLowerCase()
              : ""
        const location = typeof event.location === "string" ? event.location.toLowerCase() : ""

        return title.includes(query) || venue.includes(query) || location.includes(query)
      })
    }

    // Apply date filter
    if (filters?.date) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const weekend = new Date(today)
      weekend.setDate(today.getDate() + (6 - today.getDay()))

      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)

      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)

      result = result.filter((event) => {
        const eventDate = new Date(event.date)

        switch (filters.date) {
          case "today":
            return eventDate.toDateString() === today.toDateString()
          case "tomorrow":
            return eventDate.toDateString() === tomorrow.toDateString()
          case "weekend":
            return eventDate >= today && eventDate <= weekend
          case "week":
            return eventDate >= today && eventDate <= nextWeek
          case "month":
            return eventDate >= today && eventDate <= nextMonth
          default:
            return true
        }
      })
    }

    // Apply price filters
    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      result = result.filter((event) => {
        // Extract numeric price value
        const priceStr = typeof event.price === "string" ? event.price.replace(/[^0-9.]/g, "") : "0"
        const price = Number.parseFloat(priceStr)

        if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
          return price >= filters.priceMin && price <= filters.priceMax
        } else if (filters.priceMin !== undefined) {
          return price >= filters.priceMin
        } else if (filters.priceMax !== undefined) {
          return price <= filters.priceMax
        }
        return true
      })
    }

    setFilteredEvents(result)
  }, [events, searchQuery, filters])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 mb-4"></div>
            <div className="h-6 bg-gray-200 w-3/4 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 w-1/2"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
              <div className="h-4 bg-gray-200 w-3/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 w-1/4"></div>
              <div className="h-8 bg-gray-200 w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && filteredEvents.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (filteredEvents.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">No events found matching your criteria.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reset Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map((event) => {
        // Debug: log the event object
        console.log(event)
        // Get minimum ticket price
        let minPrice = "TBD"
        if (event.ticket_categories && event.ticket_categories.length > 0) {
          const prices = event.ticket_categories.map(tc => Number(tc.price)).filter(p => !isNaN(p))
          if (prices.length > 0) {
            minPrice = Math.min(...prices).toLocaleString()
          }
        }
        return (
          <Link href={`/events/${event.id}`} key={event.id} className="block">
            <div className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative">
                <img
                  src={event.cover || "/placeholder.svg?height=400&width=600"}
                  alt={event.event_name || "Event"}
                  className="w-full h-48 object-cover"
                />
                {event.featured && <Badge className="absolute top-2 left-2 bg-purple-700">Featured</Badge>}
                <Badge className="absolute top-2 right-2 bg-gray-800">
                  {event.category && typeof event.category === "object" && event.category.name
                    ? event.category.name
                    : typeof event.category === "string"
                      ? event.category
                      : "Event"}
                </Badge>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                  {event.event_name || "Untitled Event"}
                </h3>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2 text-purple-700" />
                    {event.start_date ? new Date(event.start_date).toLocaleDateString() : "TBD"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-purple-700" />
                    {event.venue && typeof event.venue === "object" && event.venue.name
                      ? event.venue.name
                      : typeof event.venue === "string"
                        ? event.venue
                        : "TBD"}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="font-bold text-lg">{minPrice}</p>
                  </div>
                  <Button className="bg-purple-700 hover:bg-purple-800">Book Now</Button>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
