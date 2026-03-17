import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem, Product } from "@/lib/types";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateOrderStatus } from "@/lib/admin-actions";
import { OrderSubmitButton } from "@/components/admin/order-submit-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch order details including order items and associated product info
  const { data: order, error: orderError } = await supabaseAdmin
    .from('Order')
    .select(`
      *,
      OrderItem (
        id,
        productId,
        quantity,
        price,
        Product (
          name,
          images
        )
      )
    `)
    .eq('id', id)
    .single();

  if (orderError || !order) {
    console.error("Error fetching order:", orderError);
    return <div className="text-center py-10 text-muted-foreground">Order not found or error fetching data.</div>;
  }

  // Cast types for clarity
  const typedOrder = order as unknown as Order & { OrderItem: (OrderItem & { Product: Product })[] };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
          <Link href="/admin/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order Details</h1>
          <p className="text-sm text-muted-foreground font-mono">{typedOrder.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Customer Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{typedOrder.customerName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span>{typedOrder.customerEmail}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span> <span>{typedOrder.customerPhone}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground">Address:</span> 
              <span className="text-right max-w-[60%]">{typedOrder.address}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
              <span>Ordered on:</span>
              <span>{format(new Date(typedOrder.createdAt), "dd MMM yyyy HH:mm")}</span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> <span>Rp {typedOrder.subtotal.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping:</span> <span>Rp {typedOrder.shippingFee.toLocaleString("id-ID")} (Free)</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total:</span> <span>Rp {typedOrder.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Status:</span>
              <Badge variant={typedOrder.paymentStatus === "paid" ? "default" : "secondary"} className="rounded-md font-normal">
                {typedOrder.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shipping Status:</span>
              <Badge variant="outline" className="rounded-md font-normal">
                {typedOrder.shippingStatus}
              </Badge>
            </div>
            {typedOrder.trackingNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tracking No:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{typedOrder.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Ordered Items</h2>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[80px] pl-6">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right pr-6">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typedOrder.OrderItem.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-6">
                  <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden border border-border/50">
                    <Image
                      src={item.Product?.images[0] || "/placeholder-bag.jpg"}
                      alt={item.Product?.name || "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.Product?.name || "N/A"}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">Rp {item.price.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right font-medium pr-6">Rp {(item.quantity * item.price).toLocaleString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Status Form */}
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Update Order Status</h2>
        <form action={async (formData) => { "use server"; await updateOrderStatus(formData); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="hidden" name="orderId" value={typedOrder.id} />
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select name="paymentStatus" defaultValue={typedOrder.paymentStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingStatus">Shipping Status</Label>
            <Select name="shippingStatus" defaultValue={typedOrder.shippingStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select shipping status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              type="text"
              defaultValue={typedOrder.trackingNumber || ""}
              placeholder="Enter tracking number"
              className="font-mono text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <OrderSubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
