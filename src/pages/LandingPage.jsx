import Nav from '../components/landing/Nav.jsx'
import Hero from '../components/landing/Hero.jsx'
import Drives from '../components/landing/Drives.jsx'
import Perspectives from '../components/landing/Perspectives.jsx'
import Process from '../components/landing/Process.jsx'
import Cta from '../components/landing/Cta.jsx'
import Footer from '../components/landing/Footer.jsx'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <Hero />
        <Drives />
        <Perspectives />
        <Process />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
