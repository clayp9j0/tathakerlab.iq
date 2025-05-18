import { useState } from "react"
import Link from "next/link"

interface Banner {
  id: number
  image_url: string
  link_url: string
  alt_text: string
}

interface PromoBannerProps {
  banners: Banner[]
}

export default function PromoBanner({ banners }: PromoBannerProps) {
  const [current, setCurrent] = useState(0)
  if (!banners || banners.length === 0) return null

  const goPrev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  const goNext = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1))

  const banner = banners[current]

  return (
    <div className="mb-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative flex items-center justify-center">
      <button
        aria-label="Previous banner"
        onClick={goPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
      >
        <span className="sr-only">Previous</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <Link href={banner.link_url || "#"} className="block w-full">
        <img src={banner.image_url} alt={banner.alt_text} className="w-full h-[400px] object-cover" />
      </Link>
      <button
        aria-label="Next banner"
        onClick={goNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
      >
        <span className="sr-only">Next</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  )
}
