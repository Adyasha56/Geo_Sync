import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import UseCases from '../components/landing/UseCases';
import FAQs from '../components/landing/FAQs';
import Footer from '../components/landing/Footer';

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ overflowY: 'auto', height: '100vh', overflowX: 'hidden' }}>
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <About />
      <UseCases />
      <FAQs />
      <Footer />
    </div>
  );
}