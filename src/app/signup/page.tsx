"use client"
import { useState } from "react"
import type React from "react"
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Check, Shield } from "lucide-react"

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
  const [msg, setMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setForm({ ...form, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (res.ok) {
        setMsg("Account created successfully! Welcome aboard!")
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        // Reset form
        setForm({ name: "", email: "", password: "", role: "user" })
        setPasswordStrength(0)
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        setMsg(data.message || "Sign up failed")
      }
    } catch (error) {
      setMsg("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 2) return "bg-yellow-500"
    if (passwordStrength <= 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 2) return "Fair"
    if (passwordStrength <= 3) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
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

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-100 p-8 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Join Our Community
              </h2>
              <p className="text-gray-600 text-lg font-medium">Create your account and start exploring</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 h-14 border-2 border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 h-14 border-2 border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 h-14 border-2 border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
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

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Password Strength</span>
                    <span
                      className={`text-sm font-bold ${
                        passwordStrength <= 1
                          ? "text-red-600"
                          : passwordStrength <= 2
                            ? "text-yellow-600"
                            : passwordStrength <= 3
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 shadow-sm ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className={`flex items-center gap-1 ${form.password.length >= 8 ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      8+ characters
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(form.password) ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Uppercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(form.password) ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Lowercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(form.password) ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Number
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-5 h-5 text-violet-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-violet-600 hover:text-violet-500 underline font-semibold transition-colors duration-200">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-violet-600 hover:text-violet-500 underline font-semibold transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      <span className="text-lg">Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-lg">Create Account</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </span>
              </button>

              {msg && (
                <div
                  className={`p-4 rounded-2xl border-2 transition-all duration-500 transform ${
                    msg.includes("successfully")
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800 shadow-emerald-100"
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800 shadow-red-100"
                  } shadow-lg`}
                >
                  <div className="flex items-center justify-center">
                    {msg.includes("successfully") && <Check className="w-5 h-5 mr-2 animate-bounce" />}
                    <span className="font-semibold">{msg}</span>
                  </div>
                </div>
              )}
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <a
                href="/signin"
                className="inline-flex items-center justify-center w-full h-12 border-2 border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 bg-transparent group"
              >
                <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Sign In Instead
              </a>
            </div>

            {/* Social Login Options */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-500 mb-4 font-medium">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center h-12 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-2xl transition-all duration-300 hover:scale-105 group">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">Google</span>
                </button>
                <button className="flex items-center justify-center h-12 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-2xl transition-all duration-300 hover:scale-105 group">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-medium text-gray-700">Facebook</span>
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500 font-medium">Protected with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}