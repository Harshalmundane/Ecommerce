"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Search,
  UserIcon,
  Heart,
  X,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Tag,
  Zap,
} from "lucide-react"

async function getProducts() {
  try {
    const res = await fetch("/api/products", { cache: "no-store" })
    if (res.ok) return res.json()
    return []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role || "user",
          name: payload.name || payload.email.split("@")[0],
        })
      } catch (error) {
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
    getProducts().then((data) => {
      setProducts(data)
      const uniqueCategories = [...new Set(data.map((product: any) => product.category).filter(Boolean))]
      setCategories(uniqueCategories)
    })
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartItems = JSON.parse(savedCart)
      setCart(cartItems)
      setCartCount(cartItems.reduce((total: number, item: any) => total + item.quantity, 0))
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("cart")
    setUser(null)
    setCart([])
    setCartCount(0)
    router.push("/")
  }

  const addToCart = (product: any) => {
    if (!user) {
      router.push("/signin")
      return
    }
    if (user.role === "admin") return

    const existingItemIndex = cart.findIndex((item: any) => item.id === product._id)
    let updatedCart: any

    if (existingItemIndex > -1) {
      updatedCart = cart.map((item: any, index: number) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item,
      )
    } else {
      const newItem: any = {
        id: product._id,
        name: product.name,
        price: product.price || 999,
        image: product.image || "/placeholder-product.jpg",
        quantity: 1,
      }
      updatedCart = [...cart, newItem]
    }

    setCart(updatedCart)
    const newCount = updatedCart.reduce((total: number, item: any) => total + item.quantity, 0)
    setCartCount(newCount)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const getUserDisplayName = (email: string) => email.split("@")[0]
  const isAdmin = user?.role === "admin"

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm">
        <span className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Free delivery on orders above ₹499 | Use code: FREESHIP
        </span>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">MyShop</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {!isLoading && user ? (
                <>
                  {!isAdmin && (
                    <button
                      onClick={() => setIsCartModalOpen(true)}
                      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  <div className="relative group">
                    <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <UserIcon className="w-6 h-6" />
                      <span className="hidden md:block text-sm font-medium">{getUserDisplayName(user.email)}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        {isAdmin ? (
                          <>
                            <Link href="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Manage Products
                            </Link>
                            <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Orders
                            </Link>
                            <Link href="/add" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Add Product
                            </Link>
                          </>
                        ) : (
                          <Link href="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            My Orders
                          </Link>
                        )}
                        <hr className="my-2" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                Shop Smart,
                <br />
                <span className="text-yellow-300">Save More!</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Discover amazing deals on premium products with fast delivery
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={user && isAdmin ? "/add" : "/signin"}>
                  <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                    {user && isAdmin ? "Add New Product" : "Start Shopping"}
                  </button>
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
                  View Offers
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="./public/modern-shopping-illustration.png.png"
                alt="Shopping illustration"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-sm">Free Delivery</p>
                <p className="text-xs text-gray-600">On orders above ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Easy Returns</p>
                <p className="text-xs text-gray-600">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="w-8 h-8 text-orange-600" />
              <div>
                <p className="font-semibold text-sm">24/7 Support</p>
                <p className="text-xs text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Products
              </button>
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium capitalize transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {selectedCategory === "all" ? "Featured Products" : `${selectedCategory} Collection`}
            </h2>
            <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-sm text-blue-600 hover:text-blue-700">
              Clear search
            </button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredProducts.map((product: any) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image ? `/uploads/${product.image}` : "/modern-tech-product.png"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews || 23})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{(product.price || 999).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    {user && !isAdmin ? (
                      cart.find((item: any) => item.id === product._id) ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                          <button
                            onClick={() => {
                              const cartItem = cart.find((item: any) => item.id === product._id)
                              const newQuantity = cartItem!.quantity - 1
                              if (newQuantity <= 0) {
                                const updatedCart = cart.filter((item: any) => item.id !== product._id)
                                setCart(updatedCart)
                                setCartCount(updatedCart.reduce((total: number, item: any) => total + item.quantity, 0))
                                localStorage.setItem("cart", JSON.stringify(updatedCart))
                              } else {
                                const updatedCart = cart.map((item: any) =>
                                  item.id === product._id ? { ...item, quantity: newQuantity } : item,
                                )
                                setCart(updatedCart)
                                setCartCount(updatedCart.reduce((total: number, item: any) => total + item.quantity, 0))
                                localStorage.setItem("cart", JSON.stringify(updatedCart))
                              }
                            }}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border"
                          >
                            -
                          </button>
                          <span className="font-bold text-blue-600">
                            {cart.find((item: any) => item.id === product._id)?.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const updatedCart = cart.map((item: any) =>
                                item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item,
                              )
                              setCart(updatedCart)
                              setCartCount(updatedCart.reduce((total: number, item: any) => total + item.quantity, 0))
                              localStorage.setItem("cart", JSON.stringify(updatedCart))
                            }}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      )
                    ) : user && isAdmin ? (
                      <div className="text-center py-2 text-xs text-orange-600 bg-orange-50 rounded-lg">Admin View</div>
                    ) : (
                      <button
                        onClick={() => router.push("/signin")}
                        className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Sign In to Buy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? `No results for "${searchQuery}"` : "No products found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? "Try searching with different keywords" : "Check back later for new products"}
            </p>
            {isAdmin && (
              <Link href="/add">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  Add First Product
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {!isAdmin && isCartModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setIsCartModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-96">
              {cart.length > 0 ? (
                <div className="p-6 space-y-4">
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-blue-600 font-bold">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newQuantity = item.quantity - 1
                            if (newQuantity <= 0) {
                              const updatedCart = cart.filter((cartItem: any) => cartItem.id !== item.id)
                              setCart(updatedCart)
                              setCartCount(
                                updatedCart.reduce((total: number, cartItem: any) => total + cartItem.quantity, 0),
                              )
                              localStorage.setItem("cart", JSON.stringify(updatedCart))
                            } else {
                              const updatedCart = cart.map((cartItem: any) =>
                                cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem,
                              )
                              setCart(updatedCart)
                              setCartCount(
                                updatedCart.reduce((total: number, cartItem: any) => total + cartItem.quantity, 0),
                              )
                              localStorage.setItem("cart", JSON.stringify(updatedCart))
                            }
                          }}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border"
                        >
                          -
                        </button>
                        <span className="font-bold min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const updatedCart = cart.map((cartItem: any) =>
                              cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                            )
                            setCart(updatedCart)
                            setCartCount(
                              updatedCart.reduce((total: number, cartItem: any) => total + cartItem.quantity, 0),
                            )
                            localStorage.setItem("cart", JSON.stringify(updatedCart))
                          }}
                          className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{cart.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartModalOpen(false)
                    router.push("/cart")
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}