import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { DemoSection } from '@/components/landing/DemoSection'
import { Benefits } from '@/components/landing/Benefits'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#635BFF] selection:text-white">
      <Header />
      <Hero />
      <HowItWorks />
      <DemoSection />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  )
}
