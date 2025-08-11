import connectDB from "@/lib/mongo"
import Order from "@/models/Order"
import { NextResponse } from "next/server"
import Product from "@/models/Product"

// GET - Fetch single order
export async function GET(request, { params }) {
  try {
    await connectDB()
    const order = await Order.findOne({ orderId: params.id })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// PATCH - Update order status
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const updates = await request.json()

    const order = await Order.findOne({ orderId: params.id })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const oldStatus = order.status
    const newStatus = updates.status

    // Update the order
    const updatedOrder = await Order.findOneAndUpdate({ orderId: params.id }, updates, {
      new: true,
      runValidators: true,
    })

    const lowStockAlerts = []

    // If order status changed to "delivered", reduce stock
    if (oldStatus !== "delivered" && newStatus === "delivered") {
      for (const item of order.items) {
        const product = await Product.findById(item.id)
        if (product) {
          const newStock = product.stock - item.quantity

          // Update product stock
          await Product.findByIdAndUpdate(item.id, { stock: Math.max(0, newStock) })

          // Check for low stock (less than 10 items)
          if (newStock <= 10 && newStock > 0) {
            lowStockAlerts.push({
              productId: product._id,
              productName: product.name,
              remainingStock: newStock,
            })
          } else if (newStock <= 0) {
            lowStockAlerts.push({
              productId: product._id,
              productName: product.name,
              remainingStock: 0,
              outOfStock: true,
            })
          }
        }
      }
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
      lowStockAlerts: lowStockAlerts,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
