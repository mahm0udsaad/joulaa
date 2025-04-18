export function getOrderConfirmationEmailTemplate(
  customerName,
  orderNumber,
  orderDate,
  orderTotal,
  orderItems,
  customMessage,
) {
  // Generate the order items HTML
  const orderItemsHTML = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Joulaa Beauty</title>
    <style>
      /* Base styles */
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #fafafa;
        color: #333;
        line-height: 1.6;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      .email-header {
        background: linear-gradient(to right, #f06292, #ff94c2);
        padding: 20px;
        text-align: center;
      }
      
      .logo {
        font-size: 36px;
        color: white;
        font-weight: bold;
        letter-spacing: 1px;
        margin: 0;
      }
      
      .beauty-text {
        font-size: 14px;
        color: white;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin-top: -5px;
      }
      
      .email-body {
        padding: 40px 30px;
        text-align: center;
      }
      
      h1 {
        color: #333;
        font-size: 24px;
        margin-top: 0;
        margin-bottom: 25px;
      }
      
      p {
        margin-bottom: 20px;
        font-size: 16px;
        color: #555;
      }
      
      .button {
        display: inline-block;
        background: #f06292;
        color: white;
        text-decoration: none;
        padding: 14px 35px;
        border-radius: 30px;
        font-weight: bold;
        margin: 20px 0;
        transition: background 0.3s;
        font-size: 16px;
      }
      
      .button:hover {
        background: #e91e63;
      }
      
      .divider {
        height: 1px;
        background: #eee;
        margin: 30px 0;
      }
      
      .featured-image {
        width: 100%;
        height: auto;
        max-height: 200px;
        object-fit: cover;
        margin-bottom: 20px;
      }
      
      .email-footer {
        background: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #888;
      }
      
      .social-links {
        margin: 15px 0;
      }
      
      .social-icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: #f06292;
        border-radius: 50%;
        margin: 0 5px;
        text-align: center;
        line-height: 32px;
        color: white;
        font-size: 16px;
      }
      
      .order-details {
        margin: 25px 0;
        text-align: left;
      }
      
      .order-info {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
      }
      
      .order-info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      
      .order-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      
      .order-table th {
        background: #f5f5f5;
        padding: 12px;
        text-align: left;
        font-weight: bold;
      }
      
      .order-summary {
        text-align: right;
        margin-top: 20px;
        font-weight: bold;
      }
      
      .custom-message {
        margin: 30px 0;
        padding: 20px;
        background: #fff5f8;
        border-left: 4px solid #f06292;
        text-align: left;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <div class="logo">Joulaa</div>
        <div class="beauty-text">Home Beauty</div>
      </div>
      
      <div class="email-body">
        <img src="/api/placeholder/600/200" alt="Luxury Beauty Products" class="featured-image">
        
        <h1>Order Confirmation</h1>
        
        <p>Hello ${customerName},</p>
        
        <p>Thank you for your order! We're excited to confirm that your beauty products are on their way to you.</p>
        
        <div class="order-details">
          <div class="order-info">
            <div class="order-info-item">
              <strong>Order Number:</strong>
              <span>#${orderNumber}</span>
            </div>
            <div class="order-info-item">
              <strong>Order Date:</strong>
              <span>${orderDate}</span>
            </div>
          </div>
          
          <h3>Order Summary</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
          
          <div class="order-summary">
            <p>Total: $${orderTotal}</p>
          </div>
        </div>
        
        ${customMessage ? `<div class="custom-message">${customMessage}</div>` : ""}
        
        <div class="divider"></div>
        
        <p>If you have any questions about your order, please contact our customer service team.</p>
      </div>
      
      <div class="email-footer">
        <div class="social-links">
          <span class="social-icon">f</span>
          <span class="social-icon">in</span>
          <span class="social-icon">ig</span>
        </div>
        <p>© 2025 Joulaa Beauty. All rights reserved.</p>
        <p>You received this email because you made a purchase at Joulaa Beauty.</p>
      </div>
    </div>
  </body>
  </html>`;
}
