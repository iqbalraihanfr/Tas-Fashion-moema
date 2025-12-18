import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Order } from "@/lib/types";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabaseAdmin
    .from('Order')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return <div>Error loading orders.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Shipping Status</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-xs">{order.id}</TableCell>
                <TableCell>{order.customerName} ({order.customerEmail})</TableCell>
                <TableCell>Rp {order.total.toLocaleString("id-ID")}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{order.shippingStatus}</TableCell>
                <TableCell>{format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/dashboard/orders/${order.id}`}>View Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
