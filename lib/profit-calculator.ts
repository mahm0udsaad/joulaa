import { supabase } from "./supabase";

export type ProfitSummary = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  orderCount: number;
  averageOrderValue: number;
};

export type ProfitByPeriod = {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
};

export type TopProduct = {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  profit: number;
  profit_margin: number;
};

export async function calculateProfitSummary(
  startDate?: string,
  endDate?: string,
): Promise<ProfitSummary> {
  try {
    console.log(`Calculating profit summary from ${startDate} to ${endDate}`);

    // First, get all orders that match our criteria
    let ordersQuery = supabase
      .from("orders")
      .select("id, total_amount, created_at, status, payment_status");

    // Add filter for delivered and paid orders
    ordersQuery = ordersQuery
      .eq("status", "delivered")
      .eq("payment_status", "paid");

    // Add date filters
    if (startDate) {
      // Add time to make it the beginning of the day
      ordersQuery = ordersQuery.gte("created_at", `${startDate}T00:00:00`);
    }

    if (endDate) {
      // Add time to make it the end of the day
      ordersQuery = ordersQuery.lte("created_at", `${endDate}T23:59:59`);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    console.log(`Found ${orders?.length || 0} orders for the period`);

    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        orderCount: 0,
        averageOrderValue: 0,
      };
    }

    // Now get all order items for these orders
    const orderIds = orders.map((order) => order.id);

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, quantity, cost_price")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      throw itemsError;
    }

    console.log(`Found ${orderItems?.length || 0} order items`);

    // Calculate totals
    let totalRevenue = 0;
    let totalCost = 0;
    const orderCount = orders.length;

    // Sum up revenue from orders
    orders.forEach((order) => {
      totalRevenue += Number(order.total_amount);
    });

    // Sum up costs from order items
    if (orderItems) {
      orderItems.forEach((item) => {
        const costPrice = item.cost_price ? Number(item.cost_price) : 0;
        const quantity = Number(item.quantity);
        totalCost += costPrice * quantity;
      });
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const summary = {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      orderCount,
      averageOrderValue,
    };

    console.log("Calculated summary:", summary);

    return summary;
  } catch (error) {
    console.error("Error calculating profit summary:", error);
    return {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMargin: 0,
      orderCount: 0,
      averageOrderValue: 0,
    };
  }
}

export async function getTopProducts(
  limit = 10,
  startDate?: string,
  endDate?: string,
): Promise<TopProduct[]> {
  try {
    console.log(`Getting top products from ${startDate} to ${endDate}`);

    // First, get all orders that match our criteria
    let ordersQuery = supabase
      .from("orders")
      .select("id, created_at")
      .eq("status", "delivered")
      .eq("payment_status", "paid");

    // Add date filters
    if (startDate) {
      ordersQuery = ordersQuery.gte("created_at", `${startDate}T00:00:00`);
    }

    if (endDate) {
      ordersQuery = ordersQuery.lte("created_at", `${endDate}T23:59:59`);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error("Error fetching orders for top products:", ordersError);
      throw ordersError;
    }

    console.log(
      `Found ${orders?.length || 0} orders for top products calculation`,
    );

    if (!orders || orders.length === 0) {
      return [];
    }

    // Get order items for these orders
    const orderIds = orders.map((order) => order.id);

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity, unit_price, cost_price")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Error fetching order items for top products:", itemsError);
      throw itemsError;
    }

    console.log(`Found ${items?.length || 0} order items for top products`);

    if (!items || items.length === 0) {
      return [];
    }

    // Group by product and calculate metrics
    const productMap = new Map<string, TopProduct>();

    items.forEach((item) => {
      const productId = item.product_id;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product_id: productId,
          product_name: item.product_name,
          quantity_sold: 0,
          revenue: 0,
          profit: 0,
          profit_margin: 0,
        });
      }

      const productData = productMap.get(productId)!;
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const costPrice = item.cost_price ? Number(item.cost_price) : 0;

      const itemRevenue = unitPrice * quantity;
      const itemCost = costPrice * quantity;
      const itemProfit = itemRevenue - itemCost;

      productData.quantity_sold += quantity;
      productData.revenue += itemRevenue;
      productData.profit += itemProfit;
    });

    // Calculate profit margin and convert to array
    const products = Array.from(productMap.values()).map((product) => {
      product.profit_margin =
        product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
      return product;
    });

    // Sort by profit and return top products
    const topProducts = products
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
    console.log(`Returning ${topProducts.length} top products`);

    return topProducts;
  } catch (error) {
    console.error("Error getting top products:", error);
    return [];
  }
}

// Keep getProfitByPeriod as is since it's working correctly
export async function getProfitByPeriod(
  period: "daily" | "weekly" | "monthly",
  limit = 12,
): Promise<ProfitByPeriod[]> {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        total_amount,
        order_items (
          id,
          quantity,
          unit_price,
          cost_price
        )
      `,
      )
      .eq("status", "delivered")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Group orders by period
    const periodMap = new Map<string, ProfitByPeriod>();

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      let periodKey: string;

      if (period === "daily") {
        periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        // Get the Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        periodKey = monday.toISOString().split("T")[0]; // YYYY-MM-DD of Monday
      } else {
        // Monthly
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          revenue: 0,
          cost: 0,
          profit: 0,
          orderCount: 0,
        });
      }

      const periodData = periodMap.get(periodKey)!;
      periodData.revenue += Number(order.total_amount);
      periodData.orderCount += 1;

      if (order.order_items && order.order_items.length > 0) {
        order.order_items.forEach((item) => {
          const costPrice = item.cost_price ? Number(item.cost_price) : 0;
          const quantity = Number(item.quantity);
          periodData.cost += costPrice * quantity;
        });
      }

      periodData.profit = periodData.revenue - periodData.cost;
    });

    // Convert map to array and sort by period
    return Array.from(periodMap.values())
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, limit)
      .reverse(); // Reverse to show oldest to newest
  } catch (error) {
    console.error(`Error getting profit by ${period}:`, error);
    return [];
  }
}
