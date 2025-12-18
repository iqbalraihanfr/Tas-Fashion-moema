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
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
