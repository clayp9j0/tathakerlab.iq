import { PurchasedTicket } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, MapPin, User, Phone, Tag } from "lucide-react"

interface PurchasedTicketCardProps {
  ticket: PurchasedTicket
}

export function PurchasedTicketCard({ ticket }: PurchasedTicketCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={ticket.eventImageUrl}
          alt={ticket.eventTitle}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{ticket.eventTitle}</h3>
          <p className="text-sm opacity-90">{ticket.ticketCategoryName}</p>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ticket #{ticket.ticket_number}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={ticket.is_valid ? "default" : "destructive"}>
              {ticket.is_valid ? "Valid" : "Invalid"}
            </Badge>
            <Badge variant="outline">
              {ticket.availability_status}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Purchased on {format(new Date(ticket.purchaseDate), "PPP")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(ticket.eventDate), "PPP")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{ticket.eventLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{ticket.ticketHolderName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{ticket.holder_phone}</span>
        </div>
        {ticket.ticket_category && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>
              {ticket.ticket_category.name} - 
              {ticket.ticket_category.is_free ? " Free" : ` $${ticket.ticket_category.price}`}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-4">
        <div 
          className="mx-auto h-48 w-48"
          dangerouslySetInnerHTML={{ __html: ticket.qrCodeUrl }}
        />
      </CardFooter>
    </Card>
  )
} 