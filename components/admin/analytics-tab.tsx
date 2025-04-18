import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function AnalyticsTab() {
  // In a real application, you would fetch this data from your backend
  const analyticsData = {
    visitors: 1234,
    users: 567,
    emptyCartRate: 45,
    abandonedCartRate: 23,
    totalRevenue: 15678.9,
    productViews: [
      { name: "Product A", views: 1200 },
      { name: "Product B", views: 980 },
      { name: "Product C", views: 850 },
      { name: "Product D", views: 750 },
      { name: "Product E", views: 600 },
    ],
    wishlistItems: [
      { name: "Product X", count: 89 },
      { name: "Product Y", count: 76 },
      { name: "Product Z", count: 65 },
      { name: "Product W", count: 54 },
      { name: "Product V", count: 43 },
    ],
    revenueOverTime: [
      { date: "2023-01", revenue: 10000 },
      { date: "2023-02", revenue: 12000 },
      { date: "2023-03", revenue: 15000 },
      { date: "2023-04", revenue: 13000 },
      { date: "2023-05", revenue: 16000 },
    ],
  }

  const productViewsData = {
    labels: analyticsData.productViews.map((item) => item.name),
    datasets: [
      {
        label: "Product Views",
        data: analyticsData.productViews.map((item) => item.views),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  }

  const wishlistData = {
    labels: analyticsData.wishlistItems.map((item) => item.name),
    datasets: [
      {
        label: "Wishlist Count",
        data: analyticsData.wishlistItems.map((item) => item.count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  }

  const revenueData = {
    labels: analyticsData.revenueOverTime.map((item) => item.date),
    datasets: [
      {
        label: "Revenue",
        data: analyticsData.revenueOverTime.map((item) => item.revenue),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.visitors}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users}</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empty Cart Rate</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.emptyCartRate}%</div>
            <p className="text-xs text-muted-foreground">-3.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandoned Cart Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.abandonedCartRate}%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Product Views</CardTitle>
            <CardDescription>Most viewed products in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={productViewsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Wishlist Items</CardTitle>
            <CardDescription>Most wishlisted products in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={wishlistData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Monthly revenue for the past 5 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Line data={revenueData} />
        </CardContent>
      </Card>
    </div>
  )
}
