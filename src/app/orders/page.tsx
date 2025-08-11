"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  Search,
  Filter,
  ArrowLeft,
  Shield,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  X,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import LowStockAlerts from "@/components/low-stock-alerts"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Add this right after the state declarations and before the useEffect
  console.log("Orders Page - Current user:", user)
  console.log("Orders Page - Orders:", orders)
  console.log("Orders Page - Is loading:", isLoading)

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

  // Separate useEffect for fetching orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      // Wait for user to be set before making API call
      if (!user) return

      const isAdmin = user.role === "admin"
      const url = isAdmin ? "/api/orders?admin=true" : `/api/orders?userId=${user.id}`

      console.log("Fetching orders from:", url) // Debug log
      console.log("User:", user) // Debug log

      const res = await fetch(url)
      console.log("Response status:", res.status) // Debug log

      if (res.ok) {
        const data = await res.json()
        console.log("Orders data:", data) // Debug log
        setOrders(data)
      } else {
        console.error("Failed to fetch orders:", res.status, res.statusText)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const result = await res.json()
        setOrders(orders.map((order) => (order.orderId === orderId ? { ...order, status: newStatus } : order)))
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }

        // Show success message
        if (result.lowStockAlerts && result.lowStockAlerts.length > 0) {
          const alertMessage = result.lowStockAlerts
            .map((alert) => `${alert.productName}: Only ${alert.remainingStock} left!`)
            .join("\n")
          alert(`Order updated successfully!\n\nLow Stock Alerts:\n${alertMessage}`)
        } else {
          alert("Order status updated successfully!")
        }
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error updating order")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || order.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const isAdmin = user?.role === "admin"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? "Order Management" : "My Orders"}</h1>
            <p className="text-gray-600">{isAdmin ? "Manage all customer orders" : "Track your order history"}</p>
          </div>
          {isAdmin && (
            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 text-sm font-bold">Admin Panel</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Add this button in the controls section, after the search input: */}
            <button
              onClick={() => {
                console.log("Manual fetch triggered")
                fetchOrders()
              }}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Refresh Orders
            </button>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="">All Status</option>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
                <p className="text-gray-600 text-sm">Delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{orders.reduce((total, order) => total + order.totalAmount, 0).toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Order ID</th>
                  {isAdmin && <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>}
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Items</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-blue-600">{order.orderId}</span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-gray-900">{order.userName}</p>
                            <p className="text-sm text-gray-600">{order.userEmail}</p>
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{order.totalItems} items</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === "cod"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.paymentMethod === "cod" ? "COD" : "Paid"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isAdmin ? (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* Show completion badge for delivered orders */}
                          {order.status === "delivered" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          )}

                          {/* Quick Actions for Admin - hide for delivered orders */}
                          {isAdmin && order.status !== "delivered" && (
                            <>
                              {order.status === "pending" && (
                                <button
                                  onClick={() => updateOrderStatus(order.orderId, "confirmed")}
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full hover:bg-green-700 transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {order.status === "confirmed" && (
                                <button
                                  onClick={() => updateOrderStatus(order.orderId, "processing")}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors"
                                >
                                  Process
                                </button>
                              )}
                              {order.status === "processing" && (
                                <button
                                  onClick={() => updateOrderStatus(order.orderId, "shipped")}
                                  className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full hover:bg-indigo-700 transition-colors"
                                >
                                  Ship
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <button
                                  onClick={() => updateOrderStatus(order.orderId, "delivered")}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full hover:bg-purple-700 transition-colors"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsModalOpen(true)
                            }}
                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors group"
                          >
                            <Eye className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-16 h-16 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                          <p className="text-gray-600">
                            {searchTerm || filterStatus
                              ? "Try adjusting your search or filters"
                              : "No orders have been placed yet"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono font-semibold text-blue-600">{selectedOrder.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedOrder.paymentMethod === "cod"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.status === "delivered" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Order Completed</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        This order has been successfully delivered and confirmed by the customer.
                      </p>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{selectedOrder.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                          {selectedOrder.shippingAddress.pincode}
                        </p>
                        {selectedOrder.shippingAddress.landmark && (
                          <p>Landmark: {selectedOrder.shippingAddress.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img
                          src={item.image ? `/uploads/${item.image}` : "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-blue-600">₹{item.price.toLocaleString()} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                      <span>{selectedOrder.totalItems} items</span>
                      <span>Free Shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Low Stock Alerts - Only show for admin */}
      {isAdmin && <LowStockAlerts />}
    </div>
  )
}
