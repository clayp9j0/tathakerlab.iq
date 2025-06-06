"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import EventsList from "@/components/events-list"
import Header from "@/components/header"
import PromoBanner from "@/components/promo-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCategories, getActiveEvents, type Category, type Event } from "@/lib/api"

interface Banner {
  id: number;
  image: string;
  link: string | null;
  title: string;
  is_active: boolean;
  display_order: number;
}

export default function EventsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [priceMin, setPriceMin] = useState<string>("")
  const [priceMax, setPriceMax] = useState<string>("")
  const [filters, setFilters] = useState<{
    date?: string
    priceMin?: number
    priceMax?: number
  }>({})
  const [events, setEvents] = useState<Event[]>([])
  const [hasMoreEvents, setHasMoreEvents] = useState(false)
  const [organizations, setOrganizations] = useState<{ id: number, name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners')
        if (!response.ok) {
          throw new Error('Failed to fetch banners')
        }
        const data = await response.json()
        setBanners(data)
      } catch (error) {
        console.error('Error fetching banners:', error)
      }
    }

    // Fetch events to extract organizations
    const fetchEventsAndOrganizations = async () => {
      try {
        const events = await getActiveEvents()
        setEvents(events)
        // Extract unique organizations
        const orgMap: Record<number, string> = {}
        events.forEach((ev: Event) => {
          if (ev.organization && ev.organization.id && ev.organization.name) {
            orgMap[ev.organization.id] = ev.organization.name
          }
        })
        setOrganizations(Object.entries(orgMap).map(([id, name]) => ({ id: Number(id), name })))
      } catch (error) {
        console.error("Failed to fetch events for organizations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
    fetchEventsAndOrganizations()
    fetchBanners()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const handleApplyFilters = () => {
    const newFilters: {
      date?: string
      priceMin?: number
      priceMax?: number
    } = {}

    if (dateFilter) {
      newFilters.date = dateFilter
    }

    if (priceMin) {
      newFilters.priceMin = Number.parseFloat(priceMin)
    }

    if (priceMax) {
      newFilters.priceMax = Number.parseFloat(priceMax)
    }

    setFilters(newFilters)
  }

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value)
    setCategoryFilter(value)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-2/3">
            <p className="text-gray-600">Discover and book the best events in Iraq</p>
          </div>
          <div className="w-full md:w-1/3 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  placeholder="Search events..."
                  className="pl-10 w-full"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-purple-700 hover:bg-purple-800"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Display banners from API */}
        {banners.length > 0 && (
          <PromoBanner
            banners={banners.map(b => ({
              id: b.id,
              image_url: b.image,
              link_url: b.link || "#",
              alt_text: b.title || "Banner"
            }))}
          />
        )}

        <div className="mb-8">
          <Tabs defaultValue="all" value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
              <TabsTrigger value="all">All Events</TabsTrigger>
              {!isLoading &&
                categories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category.id} value={category.slug || String(category.id)}>
                    {category.name}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Filter By</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Date</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any date</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="weekend">This weekend</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact our customer support team for assistance with bookings.
              </p>
              <Button variant="outline" className="w-full border-purple-700 text-purple-700 hover:bg-purple-50" asChild>
                <a href="https://wa.me/9647827576300" target="_blank" rel="noopener noreferrer">Contact Support</a>
              </Button>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {searchQuery ? `Showing results for "${searchQuery}"` : "Showing all events"}
              </p>
              <Select defaultValue="recommended">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="date-asc">Date: Earliest first</SelectItem>
                  <SelectItem value="date-desc">Date: Latest first</SelectItem>
                  <SelectItem value="price-asc">Price: Low to high</SelectItem>
                  <SelectItem value="price-desc">Price: High to low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <EventsList
              searchQuery={searchQuery}
              filters={filters}
              hasMoreEvents={events.length > 9}
              organizationId={categoryFilter && categoryFilter !== "all" ? Number(categoryFilter) : undefined}
            />

            {hasMoreEvents && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" className="mx-auto">
                  Load More Events
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Tathaker Lab</h3>
              <p className="text-sm text-gray-600 mb-4">Your premier destination for events in Iraq and beyond.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-purple-700">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="https://www.instagram.com/tathakerlab/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-700" onClick={(e) => {
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile) {
                    e.preventDefault();
                    window.location.href = 'instagram://user?username=tathakerlab';
                  }
                }}>
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-purple-700">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-purple-700">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/my-tickets" className="text-sm text-gray-600 hover:text-purple-700">
                    My Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="text-sm text-gray-600 hover:text-purple-700">
                    My Wallet
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-purple-700">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-purple-700">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-purple-700">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">© 2024 Tathaker Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
