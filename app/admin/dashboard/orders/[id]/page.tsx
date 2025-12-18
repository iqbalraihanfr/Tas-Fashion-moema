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
    return <div>Order not found or error fetching data.</div>;
  }

  // Cast types for clarity
  const typedOrder: Order & { OrderItem: (OrderItem & { Product: Product })[] } = order as any;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Order Details: {typedOrder.id}</h1>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-md border p-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <p><strong>Name:</strong> {typedOrder.customerName}</p>
          <p><strong>Email:</strong> {typedOrder.customerEmail}</p>
          <p><strong>Phone:</strong> {typedOrder.customerPhone}</p>
          <p><strong>Address:</strong> {typedOrder.address}</p>
          <p className="mt-4 text-sm text-muted-foreground">Ordered on: {format(new Date(typedOrder.createdAt), "dd MMM yyyy HH:mm")}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <p><strong>Subtotal:</strong> Rp {typedOrder.subtotal.toLocaleString("id-ID")}</p>
          <p><strong>Shipping:</strong> Rp {typedOrder.shippingFee.toLocaleString("id-ID")} (Free)</p>
          <p><strong>Total:</strong> Rp {typedOrder.total.toLocaleString("id-ID")}</p>
          <p className="mt-4"><strong>Payment Status:</strong> {typedOrder.paymentStatus}</p>
          <p><strong>Shipping Status:</strong> {typedOrder.shippingStatus}</p>
          {typedOrder.trackingNumber && <p><strong>Tracking No:</strong> {typedOrder.trackingNumber}</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-md border p-6">
        <h2 className="text-lg font-semibold mb-4">Ordered Items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typedOrder.OrderItem.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.Product?.images[0] || "/placeholder-bag.jpg"}
                    alt={item.Product?.name || "Product image"}
                    width={50}
                    height={50}
                    className="aspect-square rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.Product?.name || "N/A"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>Rp {item.price.toLocaleString("id-ID")}</TableCell>
                <TableCell>Rp {(item.quantity * item.price).toLocaleString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Status Form */}
      <div className="rounded-md border p-6">
        <h2 className="text-lg font-semibold mb-4">Update Order Status</h2>
        <form action={updateOrderStatus} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" name="orderId" value={typedOrder.id} />
          
          <div>
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

          <div>
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

          <div className="md:col-span-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              type="text"
              defaultValue={typedOrder.trackingNumber || ""}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="md:col-span-2">
            <OrderSubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
