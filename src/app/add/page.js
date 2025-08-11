"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, X, ImageIcon, Package, Tag, DollarSign, Hash, FileText, Zap } from "lucide-react"

const AddProductPage = () => {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    mrp: "",
    stock: "",
    status: "Active",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add all form fields
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("price", form.price)
      formData.append("category", form.category)
      formData.append("brand", form.brand)
      formData.append("mrp", form.mrp || "")
      formData.append("stock", form.stock)
      formData.append("status", form.status)

      // Add image file if selected
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add product")
      }

      setShowSuccess(true)
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        mrp: "",
        stock: "",
        status: "Active",
      })
      setImageFile(null)
      setImagePreview(null)

      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      setError(error.message || "An error occurred while adding the product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById("image")
    if (fileInput) fileInput.value = ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Product added successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add New Product</h1>
              <p className="text-blue-100">Create a new product for your store</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4" />
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Hash className="w-4 h-4" />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Food">Food & Beverages</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="brand" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4" />
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Price, MRP, and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="price" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  Price (₹)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mrp" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  MRP (₹)
                </label>
                <input
                  type="number"
                  id="mrp"
                  name="mrp"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Hash className="w-4 h-4" />
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50 resize-none"
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ImageIcon className="w-4 h-4" />
                Product Image
              </label>

              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Click to upload product image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Zap className="w-4 h-4" />
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AddProductPage
