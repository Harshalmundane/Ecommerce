import connectDB from "@/lib/mongo"
import Product from "@/models/Product"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

// GET - Fetch all products
export async function GET() {
  try {
    await connectDB()
    const products = await Product.find({}).sort({ createdAt: -1 })
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST - Add new product with image upload
export async function POST(request) {
  try {
    await connectDB()

    const formData = await request.formData()

    // Extract form fields
    const name = formData.get("name")
    const description = formData.get("description")
    const price = Number.parseFloat(formData.get("price"))
    const category = formData.get("category")
    const brand = formData.get("brand")
    const mrp = formData.get("mrp") ? Number.parseFloat(formData.get("mrp")) : undefined
    const stock = Number.parseInt(formData.get("stock"))
    const status = formData.get("status")
    const imageFile = formData.get("image")

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let imagePath = null

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads")
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        // Directory might already exist, ignore error
      }

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_") // Sanitize filename
      const filename = `${timestamp}_${originalName}`

      // Convert file to buffer and save
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filePath = join(uploadsDir, filename)
      await writeFile(filePath, buffer)

      imagePath = filename // Store just the filename in database
    }

    // Create new product
    const product = new Product({
      name,
      description,
      price,
      category,
      brand: brand || undefined,
      mrp,
      stock,
      status,
      image: imagePath,
    })

    await product.save()

    return NextResponse.json(
      {
        message: "Product added successfully",
        product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json(
      {
        error: "Failed to add product: " + error.message,
      },
      { status: 500 },
    )
  }
}
