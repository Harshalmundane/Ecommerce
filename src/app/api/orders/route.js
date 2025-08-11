import connectDB from "@/lib/mongo"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

// GET - Fetch all orders (for admin) or user orders
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const isAdmin = searchParams.get("admin") === "true"

    console.log("API - userId:", userId) // Debug log
    console.log("API - isAdmin:", isAdmin) // Debug log

    let orders
    if (isAdmin) {
      // Admin can see all orders
      console.log("Fetching all orders for admin") // Debug log
      orders = await Order.find({}).sort({ createdAt: -1 })
    } else if (userId) {
      // User can see only their orders
      console.log("Fetching orders for userId:", userId) // Debug log
      orders = await Order.find({ userId }).sort({ createdAt: -1 })
    } else {
      console.log("No userId provided and not admin") // Debug log
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Found orders:", orders.length) // Debug log
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    await connectDB()

    const orderData = await request.json()

    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const order = new Order({
      orderId,
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      userName: orderData.userName,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      totalAmount: orderData.totalAmount,
      totalItems: orderData.totalItems,
      status: orderData.status || "pending",
      paymentStatus: orderData.paymentMethod === "cod" ? "pending" : "paid",
    })

    await order.save()

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: order.orderId,
        order,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 })
  }
}
