import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { to, subject, html, from = "Joulaa <noreply@joulaa.com>" } = await req.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, or html" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "An error occurred while sending the email" }, { status: 500 })
  }
}
