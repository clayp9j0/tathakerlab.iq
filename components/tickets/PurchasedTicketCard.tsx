import { PurchasedTicket } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, MapPin, User, Phone, Tag, QrCode } from "lucide-react"
import { Button } from "../ui/button"
import { useState, Fragment } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PurchasedTicketCardProps {
  ticket: PurchasedTicket
}

export function PurchasedTicketCard({ ticket }: PurchasedTicketCardProps) {
  // Although we are not using the collapsible anymore,
  // the state might be used elsewhere or could be removed if not needed at all.
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false)

  const availabilityStatusMap: { [key: string]: string } = {
    available: "Ready to Use",
    used: "Used",
    cancelled: "Cancelled", // Assuming 'cancelled' is a possible status
    // Add other potential statuses from your backend API
  };
  const displayAvailabilityStatus = availabilityStatusMap[ticket.availability_status] || ticket.availability_status

 return (
<Card className="w-full sm:w-64 md:w-72 lg:w-80 overflow-hidden flex flex-col">
      <CardContent className="p-4">
<div className="flex items-start justify-between mb-2 flex-grow">
          <div>
            <CardTitle className="text-lg font-semibold">{ticket.eventTitle}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
 {format(new Date(ticket.eventDate), "MMMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="ml-4">
 <QrCode className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground mb-4">
          Purchased on {format(new Date(ticket.purchaseDate), "PPP")}
        </CardDescription>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <User className="h-4 w-4" />
          <span>{ticket.ticketHolderName}</span>
        </div>
<div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Phone className="h-3 w-3" />
          <span>{ticket.holder_phone}</span>
        </div>
        <div className="mt-4">
 <Badge className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#7e22ce', color: 'white' }}>{ticket.ticketCategoryName}</Badge>
        </div>
      </CardContent>
      <CardFooter className="border-t p-3"> {/* Added CardFooter back */}
        <div className="w-full"> {/* Added a div to ensure button takes full width */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code</DialogTitle>
                {/* Optional: Add a description if needed */}
                {/* <DialogDescription>Scan this code to enter the event.</DialogDescription> */}
              </DialogHeader>
              <div className="mx-auto max-w-[150px]"> {/* Adjusted max-w-[...] for smaller QR code */}
                <div dangerouslySetInnerHTML={{ __html: ticket.qrCodeUrl }} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}