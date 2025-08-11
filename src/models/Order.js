import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Add indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ orderId: 1 })
OrderSchema.index({ status: 1 })

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
