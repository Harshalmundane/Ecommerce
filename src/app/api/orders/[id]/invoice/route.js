import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/mongo"
import Order from "../../../../../models/Order"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const order = await Order.findOne({ orderId: params.id })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only allow invoice generation for delivered orders
    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Invoice only available for delivered orders" }, { status: 400 })
    }

    // Generate HTML invoice
    const invoiceHTML = generateInvoiceHTML(order)

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderId}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

function generateInvoiceHTML(order) {
  const currentDate = new Date().toLocaleDateString()
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${order.orderId}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
                padding: 20px;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .invoice-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .invoice-header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .invoice-header p {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            .invoice-body {
                padding: 30px;
            }
            
            .invoice-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .info-section h3 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.2rem;
                border-bottom: 2px solid #667eea;
                padding-bottom: 5px;
            }
            
            .info-section p {
                margin-bottom: 8px;
                color: #555;
            }
            
            .info-section strong {
                color: #333;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            
            .items-table th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            
            .items-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .items-table tr:nth-child(even) {
                background: #f8f9fa;
            }
            
            .items-table tr:hover {
                background: #e3f2fd;
            }
            
            .total-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .total-row.final {
                border-top: 2px solid #667eea;
                padding-top: 15px;
                margin-top: 15px;
                font-weight: bold;
                font-size: 1.3rem;
                color: #667eea;
            }
            
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 0.9rem;
                background: #4caf50;
                color: white;
            }
            
            .footer {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                color: #666;
                font-size: 0.9rem;
            }
            
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            }
            
            .print-button:hover {
                background: #5a67d8;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .print-button {
                    display: none;
                }
                
                .invoice-container {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
            
            @media (max-width: 768px) {
                .invoice-info {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .items-table {
                    font-size: 0.9rem;
                }
                
                .items-table th,
                .items-table td {
                    padding: 10px 8px;
                }
                
                .print-button {
                    position: static;
                    margin: 20px auto;
                    display: block;
                }
            }
        </style>
    </head>
    <body>
        <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
        
        <div class="invoice-container">
            <div class="invoice-header">
                <h1>INVOICE</h1>
                <p>Official Purchase Receipt</p>
            </div>
            
            <div class="invoice-body">
                <div class="invoice-info">
                    <div class="info-section">
                        <h3>📋 Order Details</h3>
                        <p><strong>Invoice #:</strong> INV-${order.orderId}</p>
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Order Date:</strong> ${orderDate}</p>
                        <p><strong>Invoice Date:</strong> ${currentDate}</p>
                        <p><strong>Status:</strong> <span class="status-badge">Delivered</span></p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    </div>
                    
                    <div class="info-section">
                        <h3>🚚 Shipping Address</h3>
                        <p><strong>${order.shippingAddress.fullName}</strong></p>
                        <p>${order.shippingAddress.address}</p>
                        <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
                        <p>PIN: ${order.shippingAddress.pincode}</p>
                        ${order.shippingAddress.landmark ? `<p>Landmark: ${order.shippingAddress.landmark}</p>` : ""}
                        <p>📞 ${order.shippingAddress.phone}</p>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items
                          .map(
                            (item) => `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong>
                                    ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ""}
                                </td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toLocaleString()}</td>
                                <td><strong>₹${(item.price * item.quantity).toLocaleString()}</strong></td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal (${order.totalItems} items):</span>
                        <span>₹${order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>FREE</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>Included</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Amount:</span>
                        <span>₹${order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for your purchase! This is an official invoice for your order.</p>
                <p>For any queries, please contact our customer support.</p>
                <p><strong>Generated on:</strong> ${currentDate}</p>
            </div>
        </div>
        
        <script>
            // Auto-focus for better printing experience
            window.onload = function() {
                document.title = 'Invoice-${order.orderId}';
            }
        </script>
    </body>
    </html>
  `
}
