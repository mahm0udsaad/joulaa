"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrderConfirmationEmailTemplate } from "@/lib/email-templates";

const orderStatuses = [
  "All",
  "New",
  "Processing",
  "Shipped",
  "Delivered",
  "Canceled",
  "Returned",
];

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [ordersPerPage, setOrdersPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  // Email templates based on order status
  const emailTemplates = {
    new: {
      subject: "Order Received - Thank You!",
      content:
        "Thank you for your order! We've received your order #{{order_id}} and are processing it now.",
    },
    processing: {
      subject: "Your Order is Being Processed",
      content:
        "Good news! Your order #{{order_id}} is now being processed and will be shipped soon.",
    },
    shipped: {
      subject: "Your Order Has Been Shipped",
      content:
        "Your order #{{order_id}} has been shipped! You can track your package with the tracking number: {{tracking_number}}",
    },
    delivered: {
      subject: "Your Order Has Been Delivered",
      content:
        "Your order #{{order_id}} has been delivered! We hope you enjoy your products. Please let us know if you have any questions.",
    },
    canceled: {
      subject: "Your Order Has Been Canceled",
      content:
        "Your order #{{order_id}} has been canceled as requested. If you have any questions, please contact our customer service.",
    },
    returned: {
      subject: "Your Return Request Has Been Received",
      content:
        "We've received your return request for order #{{order_id}}. We'll process it as soon as possible.",
    },
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (*)
        `,
        )
        .order("order_date", { ascending: false });

      if (selectedStatus !== "All") {
        query = query.eq("status", selectedStatus.toLowerCase());
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      // Fetch user emails separately since there's no direct join
      const userIds = ordersData.map((order) => order.user_id).filter(Boolean);

      let userData = {};
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name")
          .in("id", userIds);

        if (usersError) throw usersError;

        // Create a lookup object for users
        userData = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }

      // Combine orders with user data
      const ordersWithUserData = ordersData.map((order) => ({
        ...order,
        user: order.user_id ? userData[order.user_id] : null,
      }));

      setOrders(ordersWithUserData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus.toLowerCase() })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus.toLowerCase() }
            : order,
        ),
      );

      // Switch to email tab if changing from "new" to "processing"
      if (
        selectedOrder.status === "new" &&
        newStatus.toLowerCase() === "processing"
      ) {
        setActiveTab("email");
      }

      toast({
        title: "Status Updated",
        description: `Order #${orderId.substring(0, 8)} status changed to ${newStatus}`,
      });

      // Update selectedOrder state
      setSelectedOrder({ ...selectedOrder, status: newStatus.toLowerCase() });

      // Update email content based on new status
      updateEmailContent(newStatus.toLowerCase(), selectedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateEmailContent = (status, order) => {
    if (!order) return;

    const template =
      emailTemplates[status.toLowerCase()] || emailTemplates.processing;
    const shortOrderId = order.id.substring(0, 8);

    // Set subject
    const subject = template.subject.replace("{{order_id}}", shortOrderId);
    setEmailSubject(subject);

    // Set content with placeholders replaced
    let content = template.content.replace("{{order_id}}", shortOrderId);

    if (order.tracking_number) {
      content = content.replace("{{tracking_number}}", order.tracking_number);
    } else {
      content = content.replace(
        "{{tracking_number}}",
        "[Tracking number will be added soon]",
      );
    }

    setEmailContent(content);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    updateEmailContent(order.status, order);
    setIsDialogOpen(true);
    setActiveTab("details");
  };

  const handleSendEmail = async () => {
    if (!selectedOrder || !selectedOrder.user?.email) {
      toast({
        title: "Error",
        description: "Cannot send email - no customer email address available",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // Get customer information
      const customerName = selectedOrder.user
        ? `${selectedOrder.user.first_name || ""} ${selectedOrder.user.last_name || ""}`.trim()
        : "Customer";
      const customerEmail = selectedOrder.user?.email;

      // Format date for email
      const orderDate = new Date(selectedOrder.order_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      // Format order items for email
      const orderItems = selectedOrder.order_items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number.parseFloat(item.unit_price).toFixed(2),
        subtotal: Number.parseFloat(item.subtotal).toFixed(2),
        image: item.product_image || null,
      }));

      // Generate HTML content
      const htmlContent = getOrderConfirmationEmailTemplate(
        customerName,
        selectedOrder.id.substring(0, 8),
        orderDate,
        Number.parseFloat(selectedOrder.total_amount).toFixed(2),
        orderItems,
        emailContent, // Include our custom message in the template
      );

      // Send email via Resend
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: customerEmail,
          subject: emailSubject,
          html: htmlContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      // Update order email_sent flag in database
      await supabase
        .from("orders")
        .update({
          email_sent: true,
          last_email_date: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id);

      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${customerEmail}`,
      });

      // Close dialog after successful email
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const orderId = order.id.toLowerCase();
    const customerName = order.user
      ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.toLowerCase()
      : "";
    const customerEmail = order.user?.email?.toLowerCase() || "";

    return (
      orderId.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      new: <Badge className="bg-blue-500">New</Badge>,
      processing: <Badge className="bg-yellow-500">Processing</Badge>,
      shipped: <Badge className="bg-purple-500">Shipped</Badge>,
      delivered: <Badge className="bg-green-500">Delivered</Badge>,
      canceled: <Badge className="bg-red-500">Canceled</Badge>,
      returned: <Badge className="bg-gray-500">Returned</Badge>,
    };
    return statusMap[status] || <Badge>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      pending: (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Pending
        </Badge>
      ),
      paid: (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Paid
        </Badge>
      ),
      refunded: (
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          Refunded
        </Badge>
      ),
      failed: (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Failed
        </Badge>
      ),
    };
    return statusMap[status] || <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {orderStatuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className="whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Select value={ordersPerPage} onValueChange={setOrdersPerPage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Orders per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(0, Number.parseInt(ordersPerPage))
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user
                          ? `${order.user.first_name || ""} ${order.user.last_name || ""}`
                          : "Guest"}
                        <div className="text-xs text-gray-400">
                          {order.user?.email || "No email"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentStatusBadge(order.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number.parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No orders found matching your search."
                      : "No orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Order #{selectedOrder.id.substring(0, 8)}
              </DialogTitle>
              <DialogDescription>
                Placed on {formatDate(selectedOrder.order_date)}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="email">Email Notification</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <p>
                      {selectedOrder.user
                        ? `${selectedOrder.user.first_name || ""} ${selectedOrder.user.last_name || ""}`
                        : "Guest"}
                    </p>
                    <p>{selectedOrder.user?.email || "No email available"}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Status</h3>
                    <div className="flex items-center space-x-3">
                      <span>
                        Current: {getStatusBadge(selectedOrder.status)}
                      </span>
                      <Select
                        defaultValue={selectedOrder.status}
                        onValueChange={(value) =>
                          updateOrderStatus(selectedOrder.id, value)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedOrder.status === "new" && (
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "processing");
                            setActiveTab("email");
                          }}
                          disabled={updatingStatus}
                        >
                          {updatingStatus ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Process Order & Send Notification"
                          )}
                        </Button>
                      </div>
                    )}

                    {selectedOrder.email_sent && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-500"
                        >
                          Email Sent
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    {selectedOrder.shipping_address && (
                      <div>
                        <p>
                          {selectedOrder.shipping_address.firstName}{" "}
                          {selectedOrder.shipping_address.lastName}
                        </p>
                        <p>{selectedOrder.shipping_address.address}</p>
                        <p>
                          {selectedOrder.shipping_address.city},{" "}
                          {selectedOrder.shipping_address.state}{" "}
                          {selectedOrder.shipping_address.postalCode}
                        </p>
                        <p>{selectedOrder.shipping_address.country}</p>
                        <p>Phone: {selectedOrder.shipping_address.phone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Billing Address</h3>
                    {selectedOrder.billing_address && (
                      <div>
                        <p>
                          {selectedOrder.billing_address.firstName}{" "}
                          {selectedOrder.billing_address.lastName}
                        </p>
                        <p>{selectedOrder.billing_address.address}</p>
                        <p>
                          {selectedOrder.billing_address.city},{" "}
                          {selectedOrder.billing_address.state}{" "}
                          {selectedOrder.billing_address.postalCode}
                        </p>
                        <p>{selectedOrder.billing_address.country}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items &&
                        selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm">
                              {item.product_name}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ${Number.parseFloat(item.unit_price).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ${Number.parseFloat(item.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm text-right font-medium"
                        >
                          Subtotal:
                        </td>
                        <td className="px-4 py-2 text-sm">
                          $
                          {Number.parseFloat(
                            selectedOrder.total_amount -
                              selectedOrder.tax_amount -
                              selectedOrder.shipping_cost +
                              selectedOrder.discount_amount,
                          ).toFixed(2)}
                        </td>
                      </tr>
                      {selectedOrder.discount_amount > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-2 text-sm text-right font-medium"
                          >
                            Discount:
                          </td>
                          <td className="px-4 py-2 text-sm">
                            -$
                            {Number.parseFloat(
                              selectedOrder.discount_amount,
                            ).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm text-right font-medium"
                        >
                          Shipping:
                        </td>
                        <td className="px-4 py-2 text-sm">
                          $
                          {Number.parseFloat(
                            selectedOrder.shipping_cost,
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm text-right font-medium"
                        >
                          Tax:
                        </td>
                        <td className="px-4 py-2 text-sm">
                          $
                          {Number.parseFloat(selectedOrder.tax_amount).toFixed(
                            2,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm text-right font-bold"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold">
                          $
                          {Number.parseFloat(
                            selectedOrder.total_amount,
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="email">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      Order Status Notification
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Send a notification email to inform the customer about
                      their order status.
                    </p>

                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-md mb-4">
                      <p className="text-sm text-pink-700">
                        <strong>Note:</strong> An email notification will be
                        automatically sent when you process an order or update
                        its status. You can customize the message below before
                        sending.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To:
                        </label>
                        <Input
                          value={
                            selectedOrder.user?.email || "No email available"
                          }
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject:
                        </label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className={
                            !selectedOrder.user?.email ? "bg-gray-50" : ""
                          }
                          disabled={!selectedOrder.user?.email}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Message:
                        </label>
                        <Textarea
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                          rows={6}
                          className={`resize-none ${!selectedOrder.user?.email ? "bg-gray-50" : ""}`}
                          disabled={!selectedOrder.user?.email}
                          placeholder="This message will be included in the order notification email."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>

              {activeTab === "email" && (
                <Button
                  onClick={handleSendEmail}
                  disabled={!selectedOrder.user?.email || sendingEmail}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {sendingEmail ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Send Notification Email"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
