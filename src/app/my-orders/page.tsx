"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  Search,
  ArrowLeft,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  Calendar,
  Download,
  FileText,
  Star,
  Filter,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Banknote,
} from "lucide-react"
import SuccessToast from "@/components/success-toast"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || "user",
          name: payload.name || payload.email.split("@")[0],
        }
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("token")
        router.push("/signin")
        return
      }
    } else {
      router.push("/signin")
      return
    }
  }, [router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      if (!user) return

      const res = await fetch(`/api/orders?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100"
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100"
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100"
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100"
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 shadow-red-100"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "processing":
        return <Package className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Your order is being reviewed"
      case "confirmed":
        return "Order confirmed and being prepared"
      case "processing":
        return "Your order is being processed"
      case "shipped":
        return "Your order is on the way!"
      case "delivered":
        return "Order delivered successfully"
      case "cancelled":
        return "Order has been cancelled"
      default:
        return "Order status unknown"
    }
  }

  const confirmDelivery = async (orderId) => {
    if (!confirm("Have you received your order? This will mark it as delivered.")) {
      return
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "delivered" }),
      })

      if (res.ok) {
        // Update the orders list
        setOrders(orders.map((order) => (order.orderId === orderId ? { ...order, status: "delivered" } : order)))

        // Update selected order if it's open in modal
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, status: "delivered" })
        }

        // Show success toast
        setSuccessMessage("Thank you! Your order has been marked as delivered.")
        setShowSuccessToast(true)
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error updating order status")
    }
  }

  const downloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      if (response.ok) {
        const invoiceWindow = window.open(`/api/orders/${orderId}/invoice`, "_blank")
        if (!invoiceWindow) {
          // Fallback if popup is blocked
          window.location.href = `/api/orders/${orderId}/invoice`
        }
        setSuccessMessage("Invoice opened successfully! You can print or save it.")
        setShowSuccessToast(true)
      } else {
        alert("Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error downloading invoice:", error)
      alert("Error generating invoice")
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
    return stats
  }

  const stats = getOrderStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-violet-200 rounded-full animate-pulse mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-all duration-200">
              <div className="p-2 rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600 text-lg">Track your purchases and delivery status</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total Orders</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600 font-medium">Confirmed</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.processing}</div>
              <div className="text-sm text-gray-600 font-medium">Processing</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.shipped}</div>
              <div className="text-sm text-gray-600 font-medium">Shipped</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
              <div className="text-sm text-gray-600 font-medium">Delivered</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600 font-medium">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Order Header */}
                <div className="p-6 bg-gradient-to-r from-gray-50/80 via-white to-violet-50/80 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Package className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">#{filteredOrders.indexOf(order) + 1}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Order #{order.orderId}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">{order.totalItems} items</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{order.totalAmount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          {order.paymentMethod === "cod" ? (
                            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                              <Banknote className="w-4 h-4" />
                              <span className="text-sm font-medium">COD</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-sm font-medium">Paid</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Invoice Download Button - Only for delivered orders */}
                        {order.status === "delivered" && (
                          <button
                            onClick={() => downloadInvoice(order.orderId)}
                            className="group/btn relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                            title="Download Invoice"
                          >
                            <Download className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsModalOpen(true)
                          }}
                          className="group/btn relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center hover:from-violet-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  {/* Status Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border shadow-sm ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-gray-600 font-medium">{getStatusMessage(order.status)}</span>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Order Progress</span>
                      <span className="text-sm font-bold text-violet-600">
                        {order.status === "delivered"
                          ? "100%"
                          : order.status === "shipped"
                            ? "75%"
                            : order.status === "processing"
                              ? "50%"
                              : order.status === "confirmed"
                                ? "25%"
                                : "10%"}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${
                            order.status === "delivered"
                              ? "bg-gradient-to-r from-emerald-400 to-green-500 w-full"
                              : order.status === "shipped"
                                ? "bg-gradient-to-r from-indigo-400 to-blue-500 w-3/4"
                                : order.status === "processing"
                                  ? "bg-gradient-to-r from-purple-400 to-violet-500 w-1/2"
                                  : order.status === "confirmed"
                                    ? "bg-gradient-to-r from-blue-400 to-cyan-500 w-1/4"
                                    : "bg-gradient-to-r from-amber-400 to-orange-500 w-1/12"
                          }`}
                        ></div>
                      </div>
                      {/* Progress dots */}
                      <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-1">
                        {["pending", "confirmed", "processing", "shipped", "delivered"].map((status, index) => {
                          const isActive = ["pending", "confirmed", "processing", "shipped", "delivered"].indexOf(order.status) >= index
                          return (
                            <div
                              key={status}
                              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                isActive ? "bg-white shadow-lg scale-150" : "bg-gray-300"
                              }`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Confirmation Button */}
                  {order.status === "shipped" && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Package Received?</h4>
                            <p className="text-sm text-gray-600">Confirm delivery to complete your order</p>
                          </div>
                        </div>
                        <button
                          onClick={() => confirmDelivery(order.orderId)}
                          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Confirm Delivery
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Invoice Download Section - For delivered orders */}
                  {order.status === "delivered" && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-200 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold text-gray-900">Order Complete!</h4>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">Download your official invoice & receipt</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadInvoice(order.orderId)}
                          className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order Items Preview */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Order Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 group">
                          <div className="relative">
                            <img
                              src={item.image ? `/uploads/${item.image}` : "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 truncate mb-1">{item.name}</h5>
                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-violet-300 transition-colors">
                          <span className="text-gray-500 font-semibold">+{order.items.length - 3} more items</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-violet-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "You haven't placed any orders yet. Start shopping to see your orders here!"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Start Shopping
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600">Complete information about your order</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Invoice Download in Modal */}
                {selectedOrder.status === "delivered" && (
                  <button
                    onClick={() => downloadInvoice(selectedOrder.orderId)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Invoice
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-6 h-6 bg-violet-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      Order Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-gray-600 font-medium">Order ID:</span>
                        <span className="font-mono font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">
                          #{selectedOrder.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-gray-600 font-medium">Date:</span>
                        <span className="font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(selectedOrder.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-gray-600 font-medium">Payment:</span>
                        {selectedOrder.paymentMethod === "cod" ? (
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                            <Banknote className="w-4 h-4" />
                            <span className="text-sm font-semibold">Cash on Delivery</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-sm font-semibold">Paid Online</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Confirmation in Modal */}
                  {selectedOrder.status === "shipped" && (
                    <div className="p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Confirm Delivery</h4>
                          <p className="text-sm text-gray-600">Have you received your order?</p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelivery(selectedOrder.orderId)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        Yes, I Got My Order
                      </button>
                    </div>
                  )}

                  {/* Invoice Download in Modal */}
                  {selectedOrder.status === "delivered" && (
                    <div className="p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-200 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Official Receipt</h4>
                          <p className="text-sm text-gray-600">Download your invoice for this completed order</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadInvoice(selectedOrder.orderId)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Download Invoice
                      </button>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Shipping Address
                    </h3>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="space-y-2">
                        <p className="font-bold text-gray-900 text-lg">{selectedOrder.shippingAddress.fullName}</p>
                        <p className="text-gray-700">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-gray-700">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                          {selectedOrder.shippingAddress.pincode}
                        </p>
                        {selectedOrder.shippingAddress.landmark && (
                          <p className="text-gray-600 italic">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                        )}
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-gray-700 font-medium">📞 {selectedOrder.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group">
                          <div className="relative">
                            <img
                              src={item.image ? `/uploads/${item.image}` : "/placeholder.svg"}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-violet-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">₹{item.price.toLocaleString()} per item</p>
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium text-gray-600">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-violet-200 shadow-lg">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Order Summary</h4>
                      <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-violet-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedOrder.totalItems}</div>
                        <div className="text-sm text-gray-600 font-medium">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">FREE</div>
                        <div className="text-sm text-gray-600 font-medium">Shipping</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">0%</div>
                        <div className="text-sm text-gray-600 font-medium">Tax</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Toast */}
      <SuccessToast message={successMessage} isVisible={showSuccessToast} onClose={() => setShowSuccessToast(false)} />
    </div>
  )
}