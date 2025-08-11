import connectDB from "@/lib/mongo"
import Product from "@/models/Product"
import { NextResponse } from "next/server"
import { unlink, writeFile, mkdir } from "fs/promises"
import { join } from "path"

// GET - Fetch single product
export async function GET(request, { params }) {
  try {
    await connectDB()
    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT - Update product with image upload
export async function PUT(request, { params }) {
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

    // Find existing product
    const existingProduct = await Product.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    let imagePath = existingProduct.image // Keep existing image by default

    // Handle new image upload if provided
    if (imageFile && imageFile.size > 0) {
      // Delete old image if it exists
      if (existingProduct.image) {
        try {
          const oldImagePath = join(process.cwd(), "public", "uploads", existingProduct.image)
          await unlink(oldImagePath)
        } catch (error) {
          console.log("Old image not found or already deleted:", error.message)
        }
      }

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

      imagePath = filename // Update image path
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        price,
        category,
        brand: brand || undefined,
        mrp,
        stock,
        status,
        image: imagePath,
      },
      { new: true, runValidators: true },
    )

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product: " + error.message }, { status: 500 })
  }
}

// PATCH - Update product (for simple updates like status)
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const updates = await request.json()

    const product = await Product.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete associated image file if exists
    if (product.image) {
      try {
        const imagePath = join(process.cwd(), "public", "uploads", product.image)
        await unlink(imagePath)
      } catch (error) {
        console.log("Image file not found or already deleted:", error.message)
      }
    }

    await Product.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
