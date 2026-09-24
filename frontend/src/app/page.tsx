import FloatingPillNav from '@/components/features/landing/FloatingPillNav';
import HeroSection from '@/components/features/landing/HeroSection';
import OneSystemThreeDimensions from '@/components/features/landing/OneSystemThreeDimensions';
import InstantOrientation from '@/components/features/landing/InstantOrientation';
import GovernanceScale from '@/components/features/landing/GovernanceScale';
import SecurityTrust from '@/components/features/landing/SecurityTrust';
import FAQSection from '@/components/features/landing/FAQSection';
import CTASection from '@/components/features/landing/CTASection';
import Footer from '@/components/features/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      <FloatingPillNav />
      <HeroSection />
      <OneSystemThreeDimensions />
      <InstantOrientation />
      <GovernanceScale />
      <SecurityTrust />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
