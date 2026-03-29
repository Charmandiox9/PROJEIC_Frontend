import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import RecentProjectsSection from '@/components/home/RecentProjectsSection';
import CtaSection from '@/components/home/CtaSection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <RecentProjectsSection />
        <CtaSection />
      </main>
    </div>
  );
}