import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import AboutSection from '@/components/AboutSection'
import CVSection from '@/components/CVSection'
import ProjectsSection from '@/components/ProjectsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AboutSection />
      <CVSection />
      <ProjectsSection />
      <ContactSection />
      <Footer />
    </>
  )
}
