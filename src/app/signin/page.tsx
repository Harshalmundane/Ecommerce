"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Shield } from "lucide-react"

export default function SigninPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [msg, setMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        // Store token
        localStorage.setItem("token", data.token)

        // Debug: Log the token payload to see what's inside
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]))
          console.log("Token payload:", payload)
          console.log("User role:", payload.role)
        } catch (error) {
          console.error("Error decoding token:", error)
        }

        setMsg("Sign in successful! Redirecting...")
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setMsg(data.message || "Sign in failed")
      }
    } catch (error) {
      setMsg("An error occurred. Please try again.")
      console.error("Signin error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-2xl relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl"></div>
        <div className="relative z-10">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg font-medium">
              Sign in to your account and continue your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-12 h-14 border-2 border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pl-12 pr-12 h-14 border-2 border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isLoading ? (
                  <div className="flex items-center relative z-10">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    <span className="text-lg">Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center relative z-10">
                    <span className="text-lg mr-2">Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {msg && (
              <Alert
                className={`border-2 rounded-2xl ${
                  msg.includes("successful")
                    ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-emerald-100"
                    : "border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-red-100"
                } shadow-lg`}
              >
                <div className={`w-5 h-5 rounded-full ${msg.includes("successful") ? "bg-emerald-500" : "bg-red-500"}`}>
                  {msg.includes("successful") ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white rounded-full bg-emerald-500"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">!</div>
                  )}
                </div>
                <AlertDescription
                  className={`font-semibold ${msg.includes("successful") ? "text-emerald-800" : "text-red-800"}`}
                >
                  {msg}
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't have an account yet?
              </p>
              <Button
                onClick={() => router.push("/signup")}
                variant="outline"
                className="w-full h-12 border-2 border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 bg-transparent group"
              >
                <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Create New Account
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500 font-medium">Secured with end-to-end encryption</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}