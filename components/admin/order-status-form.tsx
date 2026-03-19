"use client";

import { useActionState } from "react";
import type { Order } from "@/lib/types";
import { updateOrderStatus } from "@/lib/admin-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderSubmitButton } from "@/components/admin/order-submit-button";

interface OrderStatusFormProps {
  order: Order;
}

export function OrderStatusForm({ order }: OrderStatusFormProps) {
  const [state, formAction] = useActionState(updateOrderStatus, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <input type="hidden" name="orderId" value={order.id} />

      <div className="space-y-2">
        <Label htmlFor="paymentStatus">Payment Status</Label>
        <Select name="paymentStatus" defaultValue={order.paymentStatus}>
          <SelectTrigger aria-label="Payment Status" className="w-full">
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
        <Select name="shippingStatus" defaultValue={order.shippingStatus}>
          <SelectTrigger aria-label="Shipping Status" className="w-full">
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

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="trackingNumber">Tracking Number</Label>
        <Input
          id="trackingNumber"
          name="trackingNumber"
          type="text"
          defaultValue={order.trackingNumber || ""}
          placeholder="Enter tracking number"
          className="font-mono text-sm"
        />
      </div>

      <div className="md:col-span-2 space-y-3">
        {state?.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state?.success ? (
          <p className="text-sm text-emerald-700">Order status updated.</p>
        ) : null}
        <div className="flex justify-end">
          <OrderSubmitButton />
        </div>
      </div>
    </form>
  );
}
