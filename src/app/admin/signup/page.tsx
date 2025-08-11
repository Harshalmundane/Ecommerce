"use client"
import { useState } from "react"
import type React from "react"
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Check, Shield, Star } from "lucide-react"

export default function AdminSignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
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
        body: JSON.stringify({ ...form, role: "admin" }),
      })

      const data = await res.json()

      if (res.ok) {
        setMsg("Admin account created successfully! Welcome aboard!")

        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("token", data.token)
        }

        // Reset form
        setForm({ name: "", email: "", password: "" })
        setPasswordStrength(0)

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        setMsg(data.message || "Admin sign up failed")
      }
    } catch (error) {
      setMsg("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-400"
    if (passwordStrength <= 2) return "bg-amber-400"
    if (passwordStrength <= 3) return "bg-blue-400"
    return "bg-emerald-400"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 2) return "Fair"
    if (passwordStrength <= 3) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-1 h-1 bg-white/20 rounded-full animate-float-${i % 4}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Glassmorphism Container */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-3xl blur opacity-25 animate-pulse"></div>
          
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 transform transition-all duration-700 hover:bg-white/8 hover:border-white/20 hover:shadow-purple-500/10 hover:shadow-2xl">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 via-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center transform transition-all duration-500 hover:rotate-6 hover:scale-110 shadow-lg shadow-purple-500/25">
                  <Shield className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full blur-sm"></div>
              </div>
              
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-100 to-violet-100 bg-clip-text text-transparent tracking-tight">
                Admin Portal
              </h1>
              <p className="text-slate-300 text-lg font-medium">Create your administrative account</p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="space-y-6">
              {/* Name Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-purple-300 group-focus-within:text-purple-200 transition-all duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-purple-300 group-focus-within:text-purple-200 transition-all duration-300" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-purple-300 group-focus-within:text-purple-200 transition-all duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                    value={form.password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-200 z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-3 animate-in slide-in-from-top duration-500">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300 font-medium">Password Strength</span>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full text-xs ${
                      passwordStrength <= 1 ? "text-red-300 bg-red-500/20" :
                      passwordStrength <= 2 ? "text-amber-300 bg-amber-500/20" :
                      passwordStrength <= 3 ? "text-blue-300 bg-blue-500/20" :
                      "text-emerald-300 bg-emerald-500/20"
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="relative w-full bg-white/10 rounded-full h-2.5 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-600/50 to-slate-500/50 rounded-full"></div>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getPasswordStrengthColor()} shadow-lg`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-2 border-purple-400 rounded focus:ring-purple-500 focus:ring-2 checked:bg-purple-500 checked:border-purple-500 transition-all duration-200"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-purple-300 hover:text-white font-semibold underline decoration-purple-300 underline-offset-2 transition-all duration-200 hover:decoration-white">
                    Admin Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-300 hover:text-white font-semibold underline decoration-purple-300 underline-offset-2 transition-all duration-200 hover:decoration-white">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold shadow-2xl shadow-purple-500/25 transform transition-all duration-300 hover:shadow-purple-500/40 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center text-lg">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Create Admin Account
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </span>
              </button>

              {/* Message Display */}
              {msg && (
                <div className={`text-center p-4 rounded-xl transition-all duration-500 transform animate-in slide-in-from-bottom ${
                  msg.includes("successfully")
                    ? "bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 shadow-lg shadow-emerald-500/10"
                    : "bg-red-500/10 text-red-200 border border-red-400/30 shadow-lg shadow-red-500/10"
                }`}>
                  <div className="flex items-center justify-center font-medium">
                    {msg.includes("successfully") && <Check className="w-5 h-5 mr-2 animate-bounce" />}
                    {msg}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-white/10">
              <p className="text-slate-300">
                Already have an admin account?{" "}
                <a
                  href="/signin"
                  className="text-purple-300 hover:text-white font-bold transition-all duration-200 hover:underline decoration-purple-300 underline-offset-2 hover:decoration-white inline-flex items-center group"
                >
                  Sign in here
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(90deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(-90deg); }
        }
        .animate-float-0 { animation: float-0 6s ease-in-out infinite; }
        .animate-float-1 { animation: float-1 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 5s ease-in-out infinite; }
      `}</style>
    </div>
  )
}