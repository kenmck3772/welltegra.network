import { useEffect } from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ProblemCards from '../components/ProblemCards';
import SolutionFlow from '../components/SolutionFlow';
import PlatformExplorer from '../components/PlatformExplorer';
import PedigreeTimeline from '../components/PedigreeTimeline';
import EngineRoom from '../components/EngineRoom';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

// Font loading component
function FontLoader() {
  useEffect(() => {
    // Load Google Fonts
    const linkSpaceGrotesk = document.createElement('link');
    linkSpaceGrotesk.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
    linkSpaceGrotesk.rel = 'stylesheet';

    const linkJetBrains = document.createElement('link');
    linkJetBrains.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap';
    linkJetBrains.rel = 'stylesheet';

    document.head.appendChild(linkSpaceGrotesk);
    document.head.appendChild(linkJetBrains);

    return () => {
      document.head.removeChild(linkSpaceGrotesk);
      document.head.removeChild(linkJetBrains);
    };
  }, []);

  return null;
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <>
      <FontLoader />
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <HeroSection />
        <ProblemCards />
        <SolutionFlow />
        <PlatformExplorer />
        <PedigreeTimeline />
        <EngineRoom />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
