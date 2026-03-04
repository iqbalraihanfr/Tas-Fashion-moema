import { supabaseAdmin } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  // Fetch counts
  const { count: productCount, error: productError } = await supabaseAdmin
    .from('Product')
    .select('*', { count: 'exact', head: true });

  const { count: orderCount, error: orderError } = await supabaseAdmin
    .from('Order')
    .select('*', { count: 'exact', head: true });

  // Calculate total revenue
  // Note: For scalability, consider creating a Postgres function (RPC) for sum
  const { data: orders, error: revenueError } = await supabaseAdmin
    .from('Order')
    .select('total');

  if (productError || orderError || revenueError) {
    console.error("Dashboard data fetch error:", productError || orderError || revenueError);
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor your store&apos;s performance and inventory.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">Rp {totalRevenue.toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{orderCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{productCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
