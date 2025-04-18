import type { Metadata } from "next"
import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Beauty & Makeup Store",
  description: "Get in touch with our customer support team for any questions or concerns",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-12">
        {/* Header */}
        <div className="mb-16 px-4 md:px-8 lg:px-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our team is here to help with any questions or concerns you may have about our products or services.
          </p>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-8 lg:px-16">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Contact Information */}
              <div className="bg-primary/95 text-white p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <p className="mb-8 opacity-90">Fill out the form and our team will get back to you within 24 hours.</p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="opacity-90 mt-1">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="opacity-90 mt-1">support@beautystore.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="opacity-90 mt-1">
                        123 Beauty Lane
                        <br />
                        New York, NY 10001
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h3 className="font-medium">Working Hours</h3>
                      <p className="opacity-90 mt-1">
                        Monday - Friday: 9AM - 6PM
                        <br />
                        Saturday: 10AM - 4PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-12">
                  <h3 className="font-medium mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="privacy" className="ml-2 text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        privacy policy
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        terms of service
                      </a>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex justify-center items-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 px-4 md:px-8 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {[
              {
                question: "How long does shipping take?",
                answer:
                  "Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout for faster delivery.",
              },
              {
                question: "What is your return policy?",
                answer:
                  "We offer a 30-day return policy on all unused and unopened products. Please contact our customer service team to initiate a return.",
              },
              {
                question: "Are your products cruelty-free?",
                answer:
                  "Yes, all of our products are cruelty-free and we never test on animals. Many of our products are also vegan-friendly, which is indicated on the product page.",
              },
              {
                question: "Do you offer international shipping?",
                answer:
                  "Yes, we ship to most countries worldwide. International shipping times and costs vary by location and are calculated at checkout.",
              },
              {
                question: "Can I track my order?",
                answer:
                  "Yes, once your order ships, you'll receive a confirmation email with tracking information so you can monitor your delivery status.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-primary mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-24 px-4 md:px-8 lg:px-16">
          <div className="rounded-2xl overflow-hidden h-96 bg-gray-200">
            {/* Replace with your actual map implementation */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Google Maps integration will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
