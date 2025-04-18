"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { CalendarIcon, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
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
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  calculateProfitSummary,
  getProfitByPeriod,
  getTopProducts,
  type ProfitSummary,
  type ProfitByPeriod,
  type TopProduct,
} from "@/lib/profit-calculator"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function ProfitsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [periodType, setPeriodType] = useState("monthly")
  const [isLoading, setIsLoading] = useState(true)
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null)
  const [profitByPeriod, setProfitByPeriod] = useState<ProfitByPeriod[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [dateRange, periodType])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Format dates for API calls
      const fromDate = format(dateRange.from, "yyyy-MM-dd")
      const toDate = format(dateRange.to, "yyyy-MM-dd")

      console.log("Loading data for period:", fromDate, "to", toDate)

      // Load all data in parallel
      const [summary, periodData, products] = await Promise.all([
        calculateProfitSummary(fromDate, toDate),
        getProfitByPeriod(periodType as "daily" | "weekly" | "monthly", 12),
        getTopProducts(10, fromDate, toDate),
      ])

      console.log("Data loaded:", { summary, periodData, products })

      setProfitSummary(summary)
      setProfitByPeriod(periodData)
      setTopProducts(products)
    } catch (error) {
      console.error("Error loading profit data:", error)
      setError("Failed to load profit data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  const chartData = {
    labels: profitByPeriod.map((item) => item.period),
    datasets: [
      {
        label: "Revenue",
        data: profitByPeriod.map((item) => item.revenue),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
      },
      {
        label: "Profit",
        data: profitByPeriod.map((item) => item.profit),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${periodType.charAt(0).toUpperCase() + periodType.slice(1)} Revenue & Profit`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value),
        },
      },
    },
  }

  // Manual refresh function
  const handleRefresh = () => {
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Profit Analytics</h1>

        <div className="flex items-center gap-2">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange(range)
                    setDatePickerOpen(false)
                  }
                }}
                numberOfMonths={2}
              />
              <div className="flex justify-between p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      from: subDays(today, 30),
                      to: today,
                    })
                    setDatePickerOpen(false)
                  }}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      from: startOfMonth(today),
                      to: endOfMonth(today),
                    })
                    setDatePickerOpen(false)
                  }}
                >
                  This Month
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(profitSummary?.totalRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      For period {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(profitSummary?.totalProfit || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      Profit Margin: {formatPercentage(profitSummary?.profitMargin || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profitSummary?.orderCount || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg. Order: {formatCurrency(profitSummary?.averageOrderValue || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(profitSummary?.totalCost || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage((profitSummary?.totalCost || 0) / (profitSummary?.totalRevenue || 1))} of
                      revenue
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Profit Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Select value={periodType} onValueChange={setPeriodType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[300px]">
                    {profitByPeriod.length > 0 ? (
                      <Bar data={chartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No data available for the selected period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profit Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Select value={periodType} onValueChange={setPeriodType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[400px]">
                    {profitByPeriod.length > 0 ? (
                      <Line
                        data={{
                          labels: profitByPeriod.map((item) => item.period),
                          datasets: [
                            {
                              label: "Profit",
                              data: profitByPeriod.map((item) => item.profit),
                              borderColor: "rgb(75, 192, 192)",
                              backgroundColor: "rgba(75, 192, 192, 0.5)",
                              tension: 0.2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top" as const,
                            },
                            title: {
                              display: true,
                              text: "Profit Trend",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (value: number) => formatCurrency(value),
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No data available for the selected period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {profitByPeriod.length > 0 ? (
                      <Bar
                        data={{
                          labels: profitByPeriod.map((item) => item.period),
                          datasets: [
                            {
                              label: "Orders",
                              data: profitByPeriod.map((item) => item.orderCount),
                              backgroundColor: "rgba(153, 102, 255, 0.5)",
                              borderColor: "rgb(153, 102, 255)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top" as const,
                            },
                            title: {
                              display: true,
                              text: "Order Volume by Period",
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No data available for the selected period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-left font-medium">Product</th>
                          <th className="p-3 text-left font-medium">Units Sold</th>
                          <th className="p-3 text-left font-medium">Revenue</th>
                          <th className="p-3 text-left font-medium">Profit</th>
                          <th className="p-3 text-left font-medium">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.length > 0 ? (
                          topProducts.map((product, index) => (
                            <tr key={product.product_id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                              <td className="p-3">{product.product_name}</td>
                              <td className="p-3">{product.quantity_sold}</td>
                              <td className="p-3">{formatCurrency(product.revenue)}</td>
                              <td className="p-3">{formatCurrency(product.profit)}</td>
                              <td className="p-3">{formatPercentage(product.profit_margin)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-3 text-center">
                              No product data available for the selected period
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Profit Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {topProducts.length > 0 ? (
                      <Bar
                        data={{
                          labels: topProducts.slice(0, 5).map((p) => p.product_name),
                          datasets: [
                            {
                              label: "Revenue",
                              data: topProducts.slice(0, 5).map((p) => p.revenue),
                              backgroundColor: "rgba(53, 162, 235, 0.5)",
                              borderColor: "rgb(53, 162, 235)",
                              borderWidth: 1,
                            },
                            {
                              label: "Profit",
                              data: topProducts.slice(0, 5).map((p) => p.profit),
                              backgroundColor: "rgba(75, 192, 192, 0.5)",
                              borderColor: "rgb(75, 192, 192)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top" as const,
                            },
                            title: {
                              display: true,
                              text: "Top 5 Products by Profit",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (value: number) => formatCurrency(value),
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No product data available for the selected period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
