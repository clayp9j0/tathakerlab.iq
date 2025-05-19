// API base URL - ensure no trailing slash
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://blue-penguin-872241.hostingersite.com").replace(
  /\/$/,
  "",
)

// Import mock data
import { mockTickets, mockUsers } from "./mock-data"

// Types
export interface User {
  id: number
  name: string
  phone: string
  token?: string
  wallet_balance?: number
}

export interface Event {
  id: number
  title: string
  date: string
  end_date?: string
  venue: string | { name: string }
  location: string
  price: string
  image: string
  category: string | { id: number; name: string }
  featured?: boolean
  organization?: { id: number; name: string; instagram?: string | null; logo?: string }
}

export interface TicketCategory {
  id: number
  name: string
  price: string
  is_free: number
  details: string | null
  sale_start_date: string
  sale_end_date: string
  quantity_available: number
}

export interface Ticket {
  id: number
  qr_code_svg: string
  event_id: number
  order_id: number
  ticket_number: string
  availability_status: string
  holder_name: string
  holder_phone: string
  is_valid: number
  created_at: string
  updated_at: string
  ticket_category: TicketCategory
}

export interface Order {
  event_id: number
  tickets: Ticket[]
}

export interface Category {
  id: number
  name: string
  description?: string
  slug?: string // Add back slug for backward compatibility
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
}

// Flag to determine if we should use mock data
// This will be set to true if any API call fails
let useMockData = false

// Function to check if the API is available
export async function checkApiAvailability(): Promise<boolean> {
  try {
    console.log("Checking API availability at:", `${API_BASE_URL}/api/events/active`)

    // Try to fetch the active events endpoint directly
    const response = await fetch(`${API_BASE_URL}/api/events/active`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add these options to help with CORS and caching issues
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
    })

    console.log("API response status:", response.status)

    // If the API is available, return true
    if (response.ok) {
      // Try to parse the response as JSON to make sure it's valid
      try {
        const responseText = await response.text()
        console.log("Raw API response:", responseText)

        // Try to parse as JSON
        const data = JSON.parse(responseText)
        console.log("API returned valid JSON data with", data.length || 0, "events")
        useMockData = false
        return true
      } catch (parseError) {
        console.error("API returned invalid JSON:", parseError)
        useMockData = true
        return false
      }
    }

    // If the API returns an error, use mock data
    console.error("API returned error status:", response.status)
    useMockData = true
    return false
  } catch (error) {
    // If there's an error (e.g., network error), use mock data
    console.error("API availability check failed:", error)
    useMockData = true
    return false
  }
}

// Authentication
export async function login(identifier: string, password: string): Promise<User> {
  try {
    console.log('Starting login process...');
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      } else {
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        throw new Error(`Failed to login: Server returned ${response.status}`);
      }
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("Expected JSON but got:", responseText);
      throw new Error("Server returned non-JSON response");
    }

    const responseData = await response.json();
    console.log("Login response data:", responseData);

    // Handle the specific API response format
    if (!responseData.token || !responseData.user) {
      console.error("Invalid API response format:", responseData);
      throw new Error("Invalid API response format");
    }

    const userData: User = {
      id: responseData.user.id,
      name: responseData.user.name,
      phone: responseData.user.phone,
      token: responseData.token,
      wallet_balance: 0 // Will be fetched separately
    };

    console.log("Processed user data:", userData);

    // Validate the user data
    if (!userData.id || !userData.name || !userData.phone || !userData.token) {
      console.error("Invalid user data structure:", {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        token: userData.token,
        rawResponse: responseData
      });
      throw new Error("Invalid user data received from server");
    }

    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(name: string, phone: string, password: string): Promise<User> {
  try {
    console.log("Attempting to register with API at:", `${API_BASE_URL}/api/register`)
    
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        phone,
        password,
        password_confirmation: password,
      }),
    })

    console.log("Register response status:", response.status)

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json()
        throw new Error(error.message || "Failed to register")
      } else {
        const errorText = await response.text()
        console.error("Non-JSON error response:", errorText)
        throw new Error(`Failed to register: Server returned ${response.status}`)
      }
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Expected JSON but got:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    const responseData = await response.json()
    console.log("Raw register response:", responseData)

    // Handle different response formats
    let userData: User

    if (responseData.user) {
      // If the response has a user object
      userData = {
        id: responseData.user.id || 0,
        name: responseData.user.name || name,
        phone: responseData.user.phone || phone,
        token: responseData.token || responseData.access_token,
        wallet_balance: responseData.user.wallet_balance || 0
      }
    } else if (responseData.data) {
      // If the response has a data object
      userData = {
        id: responseData.data.id || 0,
        name: responseData.data.name || name,
        phone: responseData.data.phone || phone,
        token: responseData.data.token || responseData.data.access_token,
        wallet_balance: responseData.data.wallet_balance || 0
      }
    } else {
      // If the response is the user object directly
      userData = {
        id: responseData.id || 0,
        name: responseData.name || name,
        phone: responseData.phone || phone,
        token: responseData.token || responseData.access_token,
        wallet_balance: responseData.wallet_balance || 0
      }
    }

    console.log("Processed user data:", userData)

    // Validate the user data
    if (!userData.id || !userData.name || !userData.phone) {
      console.error("Invalid user data structure:", {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        rawResponse: responseData
      })
      throw new Error("Invalid user data received from server")
    }

    return userData
  } catch (error) {
    console.error("Register error:", error)
    throw error
  }
}

export async function logout(token: string): Promise<void> {
  // If we're using mock data, just return
  if (useMockData) {
    console.log("Using mock logout")
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json()
        throw new Error(error.message || "Failed to logout")
      } else {
        // If not JSON, get the text and throw that as an error
        const errorText = await response.text()
        console.error("Non-JSON error response:", errorText)
        throw new Error(`Failed to logout: Server returned ${response.status}`)
      }
    }
  } catch (error) {
    console.error("Logout error:", error)
    useMockData = true
    // No need to fall back for logout
  }
}

// Update mock data to match new interfaces
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "2024-07-15",
    end_date: "2024-07-17",
    venue: "Central Park",
    location: "New York, NY",
    price: "150",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60",
    category: "Concerts",
    featured: true
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "2024-08-20",
    end_date: "2024-08-22",
    venue: "Convention Center",
    location: "San Francisco, CA",
    price: "300",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60",
    category: "Conference",
    featured: false
  },
  {
    id: 3,
    title: "Food & Wine Festival",
    date: "2024-09-10",
    end_date: "2024-09-12",
    venue: "Downtown Square",
    location: "Chicago, IL",
    price: "75",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=60",
    category: "Food & Drink",
    featured: true
  }
];

// Update event normalization function
function normalizeEvent(event: any): Event {
  // Get minimum price (handle free tickets)
  let minPrice = "TBD";
  if (Array.isArray(event.ticket_categories) && event.ticket_categories.length > 0) {
    const prices = event.ticket_categories
      .map((cat: any) => cat.is_free ? 0 : Number(cat.price))
      .filter((p: number) => !isNaN(p));
    if (prices.length > 0) {
      minPrice = Math.min(...prices).toLocaleString();
    }
  }

  return {
    id: event.id,
    title: event.event_name || event.title || "Untitled Event",
    date: event.start_date || event.date || "TBD",
    end_date: event.end_date || undefined,
    venue: event.venue?.name || (typeof event.venue === "string" ? event.venue : "TBD"),
    location: event.venue?.city || event.location || "TBD",
    category: event.category?.name || event.category || "Event",
    image: event.cover || event.image || "/images/placeholder.jpg",
    price: minPrice,
    featured: !!event.featured
  };
}

// Events
export async function getActiveEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/active`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch active events: ${response.status}`)
    }

    const data = await response.json()
    return data.map(normalizeEvent)
  } catch (error) {
    console.error("Error fetching active events:", error)
    if (useMockData) {
      return mockEvents.map(normalizeEvent)
    }
    throw error
  }
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/upcoming`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming events: ${response.status}`)
    }

    const data = await response.json()
    return data.map(normalizeEvent)
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    if (useMockData) {
      return mockEvents.map(normalizeEvent)
    }
    throw error
  }
}

export async function getCategories(): Promise<Category[]> {
  // If we're using mock data, return mock categories
  if (useMockData) {
    console.log("Using mock categories data")
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return [
      { id: 1, name: "Concerts", slug: "concerts", description: "Live music performances" },
      { id: 2, name: "Sports", slug: "sports", description: "Sporting events and competitions" },
      { id: 3, name: "Theatre", slug: "theatre", description: "Plays, musicals, and performances" },
      { id: 4, name: "Comedy", slug: "comedy", description: "Stand-up comedy and shows" },
      { id: 5, name: "Family", slug: "family", description: "Family-friendly events" },
    ]
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Expected JSON but got:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching categories:", error)
    useMockData = true

    // Fall back to mock data
    return getCategories()
  }
}

export async function getEventsByCategory(categoryId: number): Promise<Event[]> {
  // If we're using mock data, filter mock events by category
  if (useMockData) {
    console.log(`Using mock events data for category ID: ${categoryId}`)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return mockEvents.filter((event) => {
      if (typeof event.category === "object" && event.category !== null) {
        const category = event.category as Category;
        return category.id === categoryId;
      }
      // For string categories, do a simple match based on category name
      const categoryMap: Record<number, string> = {
        1: "Concerts",
        2: "Sports",
        3: "Theatre",
        4: "Comedy",
        5: "Family",
      }
      return event.category === categoryMap[categoryId]
    })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/events/active/category/${categoryId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Expected JSON but got:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    const data = await response.json()
    // Use the same normalization as getActiveEvents
    return data.map(normalizeEvent)
  } catch (error) {
    console.error("Error fetching events by category:", error)
    useMockData = true
    // Fall back to mock data
    return getEventsByCategory(categoryId)
  }
}

export async function getEventById(id: number): Promise<Event> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-cache",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.status}`)
    }

    const data = await response.json()
    return normalizeEvent(data)
  } catch (error) {
    console.error("Error fetching event:", error)
    if (useMockData) {
      const event = mockEvents.find((e) => e.id === id)
      if (!event) {
        throw new Error("Event not found")
      }
      return normalizeEvent(event)
    }
    throw error
  }
}

// Orders
export async function createOrder(order: Order, token: string): Promise<any> {
  try {
    console.log("Creating order:", order)
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(order),
    })

    if (!response.ok) {
      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create order")
      } else {
        // If not JSON, get the text and throw that as an error
        const errorText = await response.text()
        console.error("Non-JSON error response:", errorText)
        throw new Error(`Failed to create order: Server returned ${response.status}`)
      }
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Expected JSON but got:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    const data = await response.json()
    console.log("Order created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Wallet
export async function getWalletBalance(token: string): Promise<number> {
  try {
    console.log("Fetching wallet balance...")
    const response = await fetch(`${API_BASE_URL}/api/wallet/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Wallet balance response:", data)

    // Handle different response formats
    let balance = 0
    if (typeof data === 'number') {
      balance = data
    } else if (typeof data === 'object' && data !== null) {
      balance = data.balance || data.wallet_balance || data.data?.wallet_balance || 0
    }

    console.log("Processed wallet balance:", balance)
    return balance
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    throw error
  }
}

export async function depositToWallet(userId: string, amount: number, token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/deposit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        amount: amount
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to deposit to wallet")
    }

    return response.json()
  } catch (error) {
    console.error("Error depositing to wallet:", error)
    throw error
  }
}

export async function getWalletTransactions(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/me/transactions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Wallet transactions received:", data)
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data
    }
    return []
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return []
  }
}

// My Tickets
export async function getMyTickets(token: string): Promise<PaginatedResponse<Ticket>> {
  try {
    console.log('Fetching tickets with token:', token);
    const url = `${API_BASE_URL}/api/my-tickets`;
    console.log('API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Tickets response:', data);

    // If we get here but no data, return empty paginated response
    if (!data) {
      console.log('No data received, returning empty response');
      return {
        data: [],
        links: {
          first: '',
          last: '',
          prev: null,
          next: null
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: '',
          per_page: 10,
          to: 0,
          total: 0
        }
      };
    }

    // Ensure the response matches the PaginatedResponse interface
    const paginatedResponse: PaginatedResponse<Ticket> = {
      data: data.data || [],
      links: data.links || {
        first: '',
        last: '',
        prev: null,
        next: null
      },
      meta: {
        current_page: data.meta?.current_page || 1,
        from: data.meta?.from || 1,
        last_page: data.meta?.last_page || 1,
        links: data.meta?.links || [],
        path: data.meta?.path || '',
        per_page: data.meta?.per_page || 10,
        to: data.meta?.to || 0,
        total: data.meta?.total || 0
      }
    };

    return paginatedResponse;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    // If we're using mock data, return mock tickets
    if (useMockData) {
      console.log('Using mock tickets data');
      return {
        data: mockTickets,
        links: {
          first: '',
          last: '',
          prev: null,
          next: null
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: '',
          per_page: 10,
          to: mockTickets.length,
          total: mockTickets.length
        }
      };
    }
    throw error;
  }
}

// Function to fetch the Swagger documentation
export async function fetchSwaggerDocs(): Promise<any> {
  try {
    console.log("Attempting to fetch Swagger documentation...")
    const response = await fetch(`${API_BASE_URL}/swagger/documentation/json?version=all`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      mode: "cors",
      cache: "no-cache",
      // Set a reasonable timeout
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.warn(`Failed to fetch Swagger docs: ${response.status}`)
      return null
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Expected JSON but got:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    const data = await response.json()
    console.log("Swagger documentation fetched successfully")
    return data
  } catch (error) {
    // Don't propagate the error, just log it
    console.warn("Error fetching Swagger documentation:", error)
    return null
  }
}

// Add this sample event at the bottom of the file (after the mockEvents array)
// This will be used as a fallback if no event is found

export const sampleEvent: Event = {
  id: 1,
  title: "Justin Timberlake: The Forget Tomorrow World Tour",
  date: "May 21, 2024",
  venue: "Coca-Cola Arena",
  location: "City Walk, Iraq",
  category: "Concerts",
  image: "/placeholder.svg?height=600&width=1200",
  price: "299,000",
  featured: true
};

// Initialize by checking API availability
checkApiAvailability().then((available) => {
  console.log(`API availability check: ${available ? "Available" : "Unavailable"}`)
  console.log(`Using ${useMockData ? "mock" : "real"} data`)
})
