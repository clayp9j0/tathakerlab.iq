// Mock data for the application when the API is unavailable

import { Event, Ticket, User } from './api';

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "Tech Conference 2024",
    date: "2024-03-15",
    time: "09:00",
    venue: "Convention Center",
    location: "New York",
    category: "Technology",
    image: "/images/events/tech-conference.jpg",
    price: "299.99",
    featured: true,
    description: "Join us for the biggest tech conference of the year",
    ticket_categories: [
      {
        id: 1,
        name: "Early Bird",
        price: "299.99",
        is_free: 0,
        details: "Access to all sessions",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-02-01",
        quantity_available: 100
      }
    ]
  },
  {
    id: 2,
    title: "Music Festival 2024",
    date: "2024-06-15",
    time: "14:00",
    venue: "Central Park",
    location: "New York",
    category: "Music",
    image: "/images/events/music-festival.jpg",
    price: "199.99",
    featured: true,
    description: "The biggest music festival of the year",
    ticket_categories: [
      {
        id: 2,
        name: "General Admission",
        price: "199.99",
        is_free: 0,
        details: "Access to all stages",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 1000
      },
      {
        id: 3,
        name: "VIP",
        price: "499.99",
        is_free: 0,
        details: "VIP access with exclusive areas",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 100
      }
    ]
  },
  {
    id: 3,
    title: "Iraq Comedy Festival",
    date: "May 12-22, 2024",
    time: "Various times",
    venue: "Multiple Venues",
    location: "Iraq",
    category: "Comedy",
    image: "/placeholder.svg?height=400&width=600",
    price: "150.00",
    featured: false,
    description: "The Iraq Comedy Festival brings together the funniest comedians from around the world for a week of laughter and entertainment.",
    ticket_categories: [
      {
        id: 4,
        name: "Standard Ticket",
        price: "150.00",
        is_free: 0,
        details: "Access to all shows",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 200
      },
      {
        id: 5,
        name: "Premium Seating",
        price: "250.00",
        is_free: 0,
        details: "Premium seating with better views",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 100
      }
    ]
  },
  {
    id: 4,
    title: "Iraq Opera: Swan Lake Ballet",
    date: "June 3-5, 2024",
    time: "7:30 PM",
    venue: "Iraq Opera",
    location: "Downtown Iraq",
    category: "Theatre",
    image: "/placeholder.svg?height=400&width=600",
    price: "250.00",
    featured: false,
    description: "Experience the timeless beauty of Tchaikovsky's Swan Lake performed by the renowned Russian Ballet Company.",
    ticket_categories: [
      {
        id: 6,
        name: "Silver",
        price: "250.00",
        is_free: 0,
        details: "Standard seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 100
      },
      {
        id: 7,
        name: "Gold",
        price: "350.00",
        is_free: 0,
        details: "Premium seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 75
      },
      {
        id: 8,
        name: "Platinum",
        price: "450.00",
        is_free: 0,
        details: "VIP seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 50
      }
    ]
  },
  {
    id: 5,
    title: "UFC Fight Night Iraq",
    date: "June 15, 2024",
    time: "6:00 PM",
    venue: "Etihad Arena",
    location: "Yas Island, Abu Dhabi",
    category: "Sports",
    image: "/placeholder.svg?height=400&width=600",
    price: "350.00",
    featured: true,
    description: "Witness the world's top MMA fighters battle it out in the octagon at UFC Fight Night Iraq.",
    ticket_categories: [
      {
        id: 9,
        name: "Standard Seating",
        price: "350.00",
        is_free: 0,
        details: "Standard seating with good views",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 300
      },
      {
        id: 10,
        name: "Premium Seating",
        price: "550.00",
        is_free: 0,
        details: "Premium seating with excellent views",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 150
      },
      {
        id: 11,
        name: "VIP Experience",
        price: "1200.00",
        is_free: 0,
        details: "VIP seating with exclusive access",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 50
      }
    ]
  },
  {
    id: 6,
    title: "Disney On Ice: Find Your Hero",
    date: "May 25-29, 2024",
    time: "Various times",
    venue: "Coca-Cola Arena",
    location: "City Walk, Iraq",
    category: "Family",
    image: "/placeholder.svg?height=400&width=600",
    price: "175.00",
    featured: false,
    description: "Join Mickey Mouse and his friends as they take you on a journey through beloved Disney stories.",
    ticket_categories: [
      {
        id: 12,
        name: "Bronze",
        price: "175.00",
        is_free: 0,
        details: "Standard seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 200
      },
      {
        id: 13,
        name: "Silver",
        price: "225.00",
        is_free: 0,
        details: "Premium seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 150
      },
      {
        id: 14,
        name: "Gold",
        price: "275.00",
        is_free: 0,
        details: "VIP seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-05-01",
        quantity_available: 100
      }
    ]
  },
  {
    id: 7,
    title: "Coldplay: Music Of The Spheres World Tour",
    date: "January 15-19, 2025",
    time: "8:00 PM",
    venue: "Etihad Park",
    location: "Yas Island, Abu Dhabi",
    category: "Concerts",
    image: "/placeholder.svg?height=400&width=600",
    price: "350.00",
    featured: true,
    description: "Coldplay returns to the UAE with their spectacular Music Of The Spheres World Tour.",
    ticket_categories: [
      {
        id: 15,
        name: "General Admission",
        price: "350.00",
        is_free: 0,
        details: "General admission standing area",
        sale_start_date: "2024-01-01",
        sale_end_date: "2025-01-01",
        quantity_available: 500
      },
      {
        id: 16,
        name: "Golden Circle",
        price: "650.00",
        is_free: 0,
        details: "Premium standing area close to stage",
        sale_start_date: "2024-01-01",
        sale_end_date: "2025-01-01",
        quantity_available: 300
      },
      {
        id: 17,
        name: "VIP Package",
        price: "1500.00",
        is_free: 0,
        details: "VIP access with exclusive areas",
        sale_start_date: "2024-01-01",
        sale_end_date: "2025-01-01",
        quantity_available: 100
      }
    ]
  },
  {
    id: 8,
    title: "Iraq International Jazz Festival",
    date: "July 5-7, 2024",
    time: "7:00 PM",
    venue: "Iraq Media City Amphitheatre",
    location: "Iraq Media City",
    category: "Concerts",
    image: "/placeholder.svg?height=400&width=600",
    price: "295.00",
    featured: false,
    description: "The Iraq International Jazz Festival brings together world-class jazz musicians for three nights of smooth sounds under the stars.",
    ticket_categories: [
      {
        id: 18,
        name: "Regular",
        price: "295.00",
        is_free: 0,
        details: "Standard seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-07-01",
        quantity_available: 300
      },
      {
        id: 19,
        name: "VIP",
        price: "495.00",
        is_free: 0,
        details: "VIP seating with exclusive access",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-07-01",
        quantity_available: 150
      }
    ]
  },
  {
    id: 9,
    title: "Cirque du Soleil: OVO",
    date: "June 20-30, 2024",
    time: "Various times",
    venue: "Coca-Cola Arena",
    location: "City Walk, Iraq",
    category: "Theatre",
    image: "/placeholder.svg?height=400&width=600",
    price: "225.00",
    featured: false,
    description: "Enter the world of insects with Cirque du Soleil's OVO.",
    ticket_categories: [
      {
        id: 20,
        name: "Bronze",
        price: "225.00",
        is_free: 0,
        details: "Standard seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 200
      },
      {
        id: 21,
        name: "Silver",
        price: "325.00",
        is_free: 0,
        details: "Premium seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 150
      },
      {
        id: 22,
        name: "Gold",
        price: "425.00",
        is_free: 0,
        details: "VIP seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 100
      },
      {
        id: 23,
        name: "Platinum",
        price: "525.00",
        is_free: 0,
        details: "Premium VIP seating",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-01",
        quantity_available: 50
      }
    ]
  },
  {
    id: 10,
    title: "Iraq Food Festival",
    date: "May 15 - June 15, 2024",
    time: "Various times",
    venue: "Various Locations",
    location: "Iraq",
    category: "Food & Drink",
    image: "/placeholder.svg?height=400&width=600",
    price: "0.00",
    featured: false,
    description: "Celebrate Iraq's diverse culinary scene at the Iraq Food Festival.",
    ticket_categories: [
      {
        id: 24,
        name: "Free Entry",
        price: "0.00",
        is_free: 1,
        details: "General admission",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-15",
        quantity_available: 1000
      },
      {
        id: 25,
        name: "VIP Experience",
        price: "350.00",
        is_free: 0,
        details: "VIP access with exclusive areas",
        sale_start_date: "2024-01-01",
        sale_end_date: "2024-06-15",
        quantity_available: 100
      }
    ]
  },
]

export const mockTickets: Ticket[] = [
  {
    id: 1,
    qr_code_svg: "<svg>...</svg>",
    event_id: 1,
    order_id: 1,
    ticket_number: "TICKET-001",
    availability_status: "active",
    holder_name: "John Doe",
    holder_phone: "+1234567890",
    is_valid: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ticket_category: {
      id: 1,
      name: "Early Bird",
      price: "299.99",
      is_free: 0,
      details: "Access to all sessions",
      sale_start_date: "2024-01-01",
      sale_end_date: "2024-02-01",
      quantity_available: 100
    }
  },
  {
    id: 2,
    qr_code_svg: "<svg>...</svg>",
    event_id: 2,
    order_id: 2,
    ticket_number: "TICKET-002",
    availability_status: "active",
    holder_name: "Jane Smith",
    holder_phone: "+1987654321",
    is_valid: 1,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    ticket_category: {
      id: 2,
      name: "General Admission",
      price: "199.99",
      is_free: 0,
      details: "Access to all stages",
      sale_start_date: "2024-01-01",
      sale_end_date: "2024-05-01",
      quantity_available: 1000
    }
  },
  {
    id: 3,
    qr_code_svg: "<svg>...</svg>",
    event_id: 3,
    order_id: 3,
    ticket_number: "TICKET-003",
    availability_status: "active",
    holder_name: "John Doe",
    holder_phone: "+1234567890",
    is_valid: 1,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    ticket_category: {
      id: 4,
      name: "Standard Ticket",
      price: "150.00",
      is_free: 0,
      details: "Access to all shows",
      sale_start_date: "2024-01-01",
      sale_end_date: "2024-05-01",
      quantity_available: 200
    }
  },
  {
    id: 4,
    qr_code_svg: "<svg>...</svg>",
    event_id: 6,
    order_id: 4,
    ticket_number: "TICKET-004",
    availability_status: "active",
    holder_name: "Jane Doe",
    holder_phone: "+1987654321",
    is_valid: 1,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    ticket_category: {
      id: 13,
      name: "Silver",
      price: "225.00",
      is_free: 0,
      details: "Premium seating",
      sale_start_date: "2024-01-01",
      sale_end_date: "2024-05-01",
      quantity_available: 150
    }
  },
  {
    id: 5,
    qr_code_svg: "<svg>...</svg>",
    event_id: 10,
    order_id: 5,
    ticket_number: "TICKET-005",
    availability_status: "used",
    holder_name: "John Doe",
    holder_phone: "+1234567890",
    is_valid: 0,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
    ticket_category: {
      id: 25,
      name: "VIP Experience",
      price: "350.00",
      is_free: 0,
      details: "VIP access with exclusive areas",
      sale_start_date: "2024-01-01",
      sale_end_date: "2024-06-15",
      quantity_available: 100
    }
  }
]

export const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    phone: "+1234567890",
    token: "mock-token",
    wallet_balance: 1000
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+1987654321",
    token: "mock-token-2",
    wallet_balance: 500
  }
]
