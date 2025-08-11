"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Plus, Edit, Trash2, Eye, Search, Filter, ArrowLeft, Shield, Star } from "lucide-react"
import LowStockAlerts from "@/components/low-stock-alerts"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and is admin
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

        // Redirect non-admin users
        if (userData.role !== "admin") {
          router.push("/")
          return
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

    // Load products
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId))
        alert("Product deleted successfully!")
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product")
    }
  }

  const toggleProductStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setProducts(products.map((p) => (p._id === productId ? { ...p, status: newStatus } : p)))
      } else {
        alert("Failed to update product status")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error updating product")
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesStatus = !filterStatus || product.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(products.map((p) => p.category))]

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
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your store products</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-orange-600 text-sm font-bold">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Add Product Button */}
            <Link
              href="/add"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Link>
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
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.status === "Active").length}
                </p>
                <p className="text-gray-600 text-sm">Active Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.status === "Inactive").length}
                </p>
                <p className="text-gray-600 text-sm">Inactive Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-gray-600 text-sm">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Stock</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image ? `/uploads/${product.image}` : "/premium-product.png"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                          {product.mrp && (
                            <p className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleProductStatus(product._id, product.status)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.status === "Active"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {product.status}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/products/${product._id}/edit`)}
                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors group"
                          >
                            <Edit className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-16 h-16 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchTerm || filterCategory || filterStatus
                              ? "Try adjusting your search or filters"
                              : "Start by adding your first product"}
                          </p>
                          <Link
                            href="/add"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                          >
                            <Plus className="w-5 h-5" />
                            Add Product
                          </Link>
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

      {/* Low Stock Alerts */}
      <LowStockAlerts />
    </div>
  )
}
