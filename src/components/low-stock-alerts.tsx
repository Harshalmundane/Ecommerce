"use client"
import { useEffect, useState } from "react"
import { AlertTriangle, Package, X } from "lucide-react"

interface LowStockProduct {
  _id: string
  name: string
  stock: number
  category: string
}

export default function LowStockAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      const res = await fetch("/api/products/low-stock")
      if (res.ok) {
        const data = await res.json()
        setLowStockProducts(data)
        setIsVisible(data.length > 0)
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error)
    }
  }

  if (!isVisible || lowStockProducts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold">Low Stock Alert</h3>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-white hover:text-orange-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-3">
            {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} running low on stock:
          </p>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.category}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-red-500" : "text-orange-600"
                    }`}
                  >
                    {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <button
            onClick={() => (window.location.href = "/products")}
            className="w-full py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Manage Products
          </button>
        </div>
      </div>
    </div>
  )
}
