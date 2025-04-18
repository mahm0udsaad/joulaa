import { redirect } from "next/navigation"

export default function CategoryRedirectPage({ params }: { params: { slug: string } }) {
  // Redirect to the new categories route
  redirect(`/categories/${params.slug}`)
}
