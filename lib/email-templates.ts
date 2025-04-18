const getVerificationEmailTemplate = (
  userName: string,
  verificationLink: string,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .email-body {
      padding: 30px 20px;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    .divider {
      height: 1px;
      background-color: #eaeaea;
      margin: 25px 0;
    }
    .help-text {
      font-size: 14px;
      color: #666;
      margin-top: 25px;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #666;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>GLAMOUR</h1>
    </div>
    <div class="email-body">
      <h2>Verify Your Email Address</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for creating an account with Glamour! We're excited to have you join our beauty community.</p>
      <p>Please click the button below to verify your email address and activate your account:</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </div>
      
      <div class="divider"></div>
      
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
      
      <p class="help-text">
        If you're having trouble clicking the button, copy and paste the URL below into your web browser:
        <br>
        <a href="${verificationLink}" style="color: #ff758c; word-break: break-all;">${verificationLink}</a>
      </p>
    </div>
    <div class="email-footer">
      <p>© 2023 Glamour Beauty. All rights reserved.</p>
      <p>123 Beauty Lane, Makeup City, MC 12345</p>
      <div class="social-links">
        <a href="#">Instagram</a> | <a href="#">Facebook</a> | <a href="#">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const getOrderConfirmationEmailTemplate = (
  userName: string,
  orderNumber: string,
  orderDate: string,
  orderTotal: string,
  orderItems: any[],
) => {
  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">
        <div style="font-weight: 500;">${item.product_name}</div>
        <div style="color: #666; font-size: 12px;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">
        ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.unit_price)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .email-body {
      padding: 30px 20px;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .order-info {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .order-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .order-info-label {
      font-weight: 500;
      color: #666;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .order-total {
      font-weight: bold;
      font-size: 18px;
      text-align: right;
      margin-top: 15px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    .divider {
      height: 1px;
      background-color: #eaeaea;
      margin: 25px 0;
    }
    .help-text {
      font-size: 14px;
      color: #666;
      margin-top: 25px;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #666;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>GLAMOUR</h1>
    </div>
    <div class="email-body">
      <h2>Order Confirmation</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for your order! We're processing it now and will ship it as soon as possible.</p>
      
      <div class="order-info">
        <div class="order-info-row">
          <span class="order-info-label">Order Number:</span>
          <span>${orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Order Date:</span>
          <span>${orderDate}</span>
        </div>
      </div>
      
      <h3>Order Summary</h3>
      <table class="order-table">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Item</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eaeaea;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="order-total">
        Total: ${orderTotal}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://your-domain.com/account?tab=orders" class="button">View Order Details</a>
      </div>
      
      <div class="divider"></div>
      
      <p>If you have any questions about your order, please contact our customer service team.</p>
      
      <p class="help-text">
        Thank you for shopping with Glamour!
      </p>
    </div>
    <div class="email-footer">
      <p>© 2023 Glamour Beauty. All rights reserved.</p>
      <p>123 Beauty Lane, Makeup City, MC 12345</p>
      <div class="social-links">
        <a href="#">Instagram</a> | <a href="#">Facebook</a> | <a href="#">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export { getVerificationEmailTemplate, getOrderConfirmationEmailTemplate };
