import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { useCemeteries } from '@/hooks/useCemeteries';

function StatItem({ value, label, revealed, delay }: { value: number; label: string; revealed: boolean; delay: number }) {
  const count = useCountUp(value, 2200, revealed);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={revealed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="text-center"
    >
      <span className="block text-5xl lg:text-6xl xl:text-7xl font-thin text-ivory mb-3 tabular-nums font-display tracking-tight">
        {count}+
      </span>
      <span className="text-[11px] lg:text-xs text-ivory/50 uppercase tracking-[0.2em] font-medium">
        {label}
      </span>
    </motion.div>
  );
}

export default function Statistics() {
  const { t } = useLanguage();
  const { ref, revealed } = useScrollReveal(0.3);
  const { stats } = useCemeteries();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-deep-forest">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('/images/aerial-cemetery.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-deep-forest/80 via-deep-forest/70 to-deep-forest/80" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          <StatItem value={stats.totalCemeteries} label={t.cemeteries.managed} revealed={revealed} delay={0} />
          <StatItem value={stats.communesCovered} label={t.cemeteries.communes} revealed={revealed} delay={0.1} />
          <StatItem value={stats.hectaresMaintained} label={t.cemeteries.hectares} revealed={revealed} delay={0.2} />
          <StatItem value={stats.agentsDeployed} label={t.cemeteries.agents} revealed={revealed} delay={0.3} />
        </div>
      </div>
    </section>
  );
}
