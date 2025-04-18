import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  subtitle?: string;
}

export default function SectionCard({
  title,
  subtitle,
  image,
  link,
  linkText,
}: SectionCardProps) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden group">
      <div className="absolute inset-0">
        <Image
          src={image || "/placeholder.svg?height=400&width=300"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 300px"
          loading="lazy" // Add lazy loading
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="mb-4 text-sm text-gray-200">{subtitle}</p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="self-start bg-transparent text-white border-white hover:bg-white hover:text-black"
        >
          <Link href={link}>{linkText}</Link>
        </Button>
      </div>
    </div>
  );
}
