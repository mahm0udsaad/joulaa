// Homepage management types
export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  image: string
  order: number
  active: boolean
}

export interface CategoryShowcaseItem {
  id: string
  name: string
  icon: string
  color: string
  href: string
  image: string
  order: number
  active: boolean
}

export interface SectionCardItem {
  id: string
  title: string
  description: string
  image: string
  link: string
  linkText: string
  position: string // e.g., "trending", "featured", "new-arrivals", "best-sellers"
  order: number
  active: boolean
}

export interface HomePageSection {
  id: string
  type:
    | "hero"
    | "category-showcase"
    | "trending"
    | "featured"
    | "new-arrivals"
    | "best-sellers"
    | "promo"
    | "end-of-month-sale"
  title: string
  visible: boolean
  order: number
}

export interface HomePageState {
  sections: HomePageSection[]
  heroSlides: HeroSlide[]
  categoryItems: CategoryShowcaseItem[]
  sectionCards: SectionCardItem[]
  isLoading: boolean
  error: string | null
}
