import connectDB from "@/lib/mongo"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields required" }), { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // ✅ Make sure role is saved
    })

    await user.save()

    // ✅ Create JWT token with all necessary fields
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "yoursecret",
      { expiresIn: "1d" },
    )

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return new Response(JSON.stringify({ message: error.message }), { status: 500 })
  }
}
