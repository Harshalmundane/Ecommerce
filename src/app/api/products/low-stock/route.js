import connectDB from "@/lib/mongo"
import Product from "@/models/Product"
import { NextResponse } from "next/server"

// GET - Fetch products with low stock (10 or less)
export async function GET() {
  try {
    await connectDB()

    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
      status: "Active",
    }).sort({ stock: 1 }) // Sort by stock ascending (lowest first)

    return NextResponse.json(lowStockProducts)
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 })
  }
}
