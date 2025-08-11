"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, CreditCard, Truck, User, Phone, Mail, Home, CheckCircle } from "lucide-react"

export default function CheckoutPage() {
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const router = useRouter()

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("cod") // cod or online

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

        // Pre-fill user data
        setShippingAddress((prev) => ({
          ...prev,
          fullName: userData.name,
          email: userData.email,
        }))
      } catch (error) {
        localStorage.removeItem("token")
        router.push("/signin")
        return
      }
    } else {
      router.push("/signin")
      return
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      if (cartData.length === 0) {
        router.push("/cart")
        return
      }
      setCart(cartData)
    } else {
      router.push("/cart")
      return
    }

    setIsLoading(false)
  }, [router])

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setCurrentStep(2)
  }

  const handleOrderSubmit = async () => {
    setIsSubmitting(true)

    try {
      const orderData = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        items: cart,
        shippingAddress,
        paymentMethod,
        totalAmount: getTotalPrice(),
        totalItems: getTotalItems(),
        status: "pending",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      const result = await response.json()
      setOrderId(result.orderId)

      if (paymentMethod === "online") {
        // Simulate Razorpay payment
        handleRazorpayPayment(result.orderId, getTotalPrice())
      } else {
        // Cash on Delivery - Order placed successfully
        completeOrder()
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRazorpayPayment = (orderId, amount) => {
    // Simulate Razorpay integration
    const options = {
      key: "rzp_test_demo", // Demo key
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "MyShop",
      description: "Order Payment",
      order_id: orderId,
      handler: (response) => {
        // Payment successful
        console.log("Payment successful:", response)
        completeOrder()
      },
      prefill: {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
      },
      theme: {
        color: "#3B82F6",
      },
    }

    // Simulate payment success after 2 seconds
    setTimeout(() => {
      completeOrder()
    }, 2000)
  }

  const completeOrder = () => {
    // Clear cart
    localStorage.removeItem("cart")
    setCart([])
    setOrderPlaced(true)
    setCurrentStep(3)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your order #{orderId} has been placed successfully.
              {paymentMethod === "cod" ? " You will pay cash on delivery." : " Payment has been processed."}
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Continue Shopping
              </Link>
              <Link
                href="/orders"
                className="block w-full py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Cart</span>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Shipping Address</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Home className="w-4 h-4" />
                      Complete Address
                    </label>
                    <textarea
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                      rows={3}
                      placeholder="House/Flat No., Street, Area"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Pincode</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Near landmark, building, etc."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-8">
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "cod" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cod" && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <Truck className="w-6 h-6 text-gray-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "online" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "online" && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">Pay Now</h3>
                        <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handleOrderSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Placing Order...
                      </div>
                    ) : (
                      `Place Order - ₹${getTotalPrice().toLocaleString()}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image ? `/uploads/${item.image}` : "/placeholder.svg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-semibold">₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-blue-600">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
