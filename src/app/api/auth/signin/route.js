import connectDB from "@/lib/mongo"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "All fields required" }), { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 })
    }

    // ✅ FIXED: Include role, name, and userId in the JWT token
    const token = jwt.sign(
      {
        userId: user._id, // Changed from 'id' to 'userId' to match frontend
        email: user.email,
        role: user.role || "user", // ✅ Added role field
        name: user.name || user.email.split("@")[0], // ✅ Added name field
      },
      process.env.JWT_SECRET || "yoursecret",
      { expiresIn: "1d" },
    )

    return new Response(
      JSON.stringify({
        message: "Signin successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role || "user",
          name: user.name || user.email.split("@")[0],
        },
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Signin error:", error)
    return new Response(JSON.stringify({ message: error.message }), { status: 500 })
  }
}
