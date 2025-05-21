"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MapPin } from "lucide-react"
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
  hasMoreEvents?: boolean
  organizationId?: number
}

export default function EventsList({ categoryId, searchQuery, filters, hasMoreEvents, organizationId }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch events based on category
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        let data: Event[]
        if (categoryId && categoryId !== "all") {
          const catId = typeof categoryId === "string" ? Number.parseInt(categoryId, 10) : categoryId
          data = await getEventsByCategory(catId)
        } else {
          data = await getActiveEvents()
        }
        setEvents(data)
        console.log("Fetched events:", data)
      } catch (err) {
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
    // Filter by organization if provided
    if (organizationId) {
      result = result.filter(event => event.organization && event.organization.id === organizationId)
    }
    // Apply search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((event) => {
        const title = typeof event.title === "string" ? event.title.toLowerCase() : ""
        const venue = typeof event.venue === "string" ? event.venue.toLowerCase() : ""
        const location = typeof event.location === "string" ? event.location.toLowerCase() : ""
        return title.includes(query) || venue.includes(query) || location.includes(query)
      })
    }
    // Apply date filter
    if (filters?.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const weekend = new Date(today);
      weekend.setDate(today.getDate() + (6 - today.getDay()));
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      result = result.filter((event) => {
        const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.date);
        eventEndDate.setHours(0, 0, 0, 0);
        switch (filters.date) {
          case "today":
            return eventEndDate.getTime() === today.getTime();
          case "tomorrow":
            return eventEndDate.getTime() === tomorrow.getTime();
          case "weekend":
            return eventEndDate >= today && eventEndDate <= weekend;
          case "week":
            return eventEndDate >= today && eventEndDate <= nextWeek;
          case "month":
            return eventEndDate >= today && eventEndDate <= nextMonth;
          default:
            return true;
        }
      });
    }
    // Apply price filters
    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      result = result.filter((event) => {
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
  }, [events, searchQuery, filters, organizationId])

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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto max-w-screen-xl">
      {filteredEvents.map((event) => (
        <Link href={`/events/${event.id}`} key={event.id} className="block">
          <div className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="relative">
              <img
                src={event.image || "/placeholder.svg?height=400&width=600"}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              {event.featured && <Badge className="absolute top-2 left-2 bg-purple-700">Featured</Badge>}
              <Badge className="absolute top-2 right-2 bg-gray-800">
                {typeof event.category === "object" && event.category !== null
                  ? (event.category as any).name
                  : event.category || "Event"}
              </Badge>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-lg mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                {event.title}
              </h3>
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4 mr-2 text-purple-700" />
                  {event.end_date
                    ? new Date(event.end_date).toLocaleDateString('en-GB')
                    : event.date
                      ? new Date(event.date).toLocaleDateString('en-GB')
                      : "TBD"}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-purple-700" />
                  {typeof event.venue === "object" && event.venue !== null
                    ? (event.venue as any).name
                    : event.venue || "TBD"}
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="font-bold text-lg">{event.price} <span className="text-xs text-gray-500">IQD</span></p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {hasMoreEvents && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="mx-auto">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  )
}
