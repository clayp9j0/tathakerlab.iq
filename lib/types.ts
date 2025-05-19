export interface PurchasedTicket {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventImageUrl: string;
  eventImageHint: string;
  ticketCategoryName: string;
  ticketHolderName: string;
  purchaseDate: string;
  qrCodeUrl: string;
  is_valid: number;
  ticket_number: string;
  holder_phone: string;
  availability_status: string;
  ticket_category?: {
    id: number;
    name: string;
    price: string | null;
    is_free: number;
    details: string | null;
    sale_start_date: string;
    sale_end_date: string;
    quantity_available: number;
  };
}

export interface TicketCategory {
  id: number;
  name: string;
  price: string | null;
  is_free: number;
  details: string | null;
  sale_start_date: string;
  sale_end_date: string;
  quantity_available: number;
}

export interface Event {
  id: number;
  event_name: string;
  cover: string;
  description: string | null;
  start_date: string;
  end_date: string;
  max_tickets: number;
  organization: {
    id: number;
    name: string;
    instagram: string | null;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    location: string | null;
    address: string;
    city: string;
  };
  category: {
    id: number;
    name: string;
  };
  ticket_categories: TicketCategory[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
} 