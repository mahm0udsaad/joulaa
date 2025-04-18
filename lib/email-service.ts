import {
  getOrderConfirmationEmailTemplate,
  getVerificationEmailTemplate,
} from "@/lib/email-templates.ts";

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationLink: string,
) {
  try {
    const htmlContent = getVerificationEmailTemplate(
      userName,
      verificationLink,
    );

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Verify Your Email - Glamour Beauty",
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send verification email");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  userName: string,
  orderNumber: string,
  orderDate: string,
  orderTotal: string,
  orderItems: any[],
) {
  try {
    const htmlContent = getOrderConfirmationEmailTemplate(
      userName,
      orderNumber,
      orderDate,
      orderTotal,
      orderItems,
    );

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Order Confirmation - Glamour Beauty",
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Failed to send order confirmation email",
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
}
