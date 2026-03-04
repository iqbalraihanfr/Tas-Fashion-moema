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
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Orders Management</h1>
        <p className="text-sm text-muted-foreground">View and manage customer orders.</p>
      </div>
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium">Order ID</TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">Total</TableHead>
              <TableHead className="font-medium">Payment</TableHead>
              <TableHead className="font-medium">Shipping</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-xs text-muted-foreground">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                </TableCell>
                <TableCell className="font-medium">Rp {order.total.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"} className="rounded-md font-normal">
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-md font-normal text-muted-foreground">
                    {order.shippingStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild className="h-8">
                    <Link href={`/admin/dashboard/orders/${order.id}`}>View</Link>
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
