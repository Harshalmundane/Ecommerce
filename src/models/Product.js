import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  mrp: Number,
  stock: Number,
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  image: String,
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);