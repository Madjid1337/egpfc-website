import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { MapPinHouse, Phone, Mail, Clock, Send } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Contact() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: MapPinHouse, label: t.contact.address, value: 'Alger, Algérie' },
    { icon: Phone, label: t.contact.phone, value: '[NUMÉRO DE TÉLÉPHONE]' },
    { icon: Mail, label: t.contact.email, value: '[EMAIL OFFICIEL]' },
  ];

  return (
    <section className="py-24 lg:py-32 xl:py-40 bg-off-white">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 lg:mb-20"
        >
          <p className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-3">
            {t.contact.heading}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-28">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] lg:text-[11px] tracking-[0.12em] text-olive/50 uppercase mb-2 font-medium">
                    {t.contact.formName}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest placeholder:text-olive/30 focus:outline-none focus:border-muted-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] lg:text-[11px] tracking-[0.12em] text-olive/50 uppercase mb-2 font-medium">
                    {t.contact.formEmail}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest placeholder:text-olive/30 focus:outline-none focus:border-muted-gold transition-colors"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] lg:text-[11px] tracking-[0.12em] text-olive/50 uppercase mb-2 font-medium">
                    {t.contact.formPhone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest placeholder:text-olive/30 focus:outline-none focus:border-muted-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] lg:text-[11px] tracking-[0.12em] text-olive/50 uppercase mb-2 font-medium">
                    {t.contact.formSubject}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest placeholder:text-olive/30 focus:outline-none focus:border-muted-gold transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] lg:text-[11px] tracking-[0.12em] text-olive/50 uppercase mb-2 font-medium">
                  {t.contact.formMessage}
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest placeholder:text-olive/30 focus:outline-none focus:border-muted-gold transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="group inline-flex items-center gap-3 bg-deep-forest text-ivory px-8 py-3.5 text-[13px] font-semibold tracking-[0.08em] hover:bg-deep-forest/90 transition-colors"
              >
                {t.contact.formSubmit}
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </button>
              {submitted && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-olive/70"
                >
                  {t.contact.success}
                </motion.p>
              )}
            </form>
          </motion.div>

          {/* Contact Info & Image */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? -30 : 30 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Architectural image placeholder */}
            <div className="aspect-[4/3] bg-light-gray mb-10 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-olive/15 to-deep-forest/10 flex items-center justify-center">
                <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <linearGradient id="door" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C4B998" />
                      <stop offset="100%" stopColor="#B8AA86" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="300" fill="#E8E6DF" />
                  <rect x="0" y="120" width="400" height="180" fill="#D4C9A8" opacity="0.5" />
                  {/* Islamic arch doorway */}
                  <path d="M140,300 L140,160 Q200,100 260,160 L260,300 Z" fill="url(#door)" opacity="0.8" />
                  <path d="M150,300 L150,165 Q200,112 250,165 L250,300 Z" fill="#163A2D" opacity="0.3" />
                  {/* Details */}
                  <rect x="180" y="140" width="40" height="80" fill="#B89555" opacity="0.2" />
                  <line x1="200" y1="130" x2="200" y2="100" stroke="#B89555" strokeWidth="2" opacity="0.3" />
                </svg>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-5">
              {contactInfo.map((item, i) => (
                <div key={i} className={`flex items-start gap-4 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 text-olive/40">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] tracking-[0.1em] text-olive/40 uppercase mb-0.5">{item.label}</p>
                    <p className={`text-sm lg:text-base text-deep-forest ${lang === 'ar' ? 'font-arabic' : ''}`}>{item.value}</p>
                  </div>
                </div>
              ))}
              <div className={`flex items-start gap-4 pt-2 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-10 h-10 flex items-center justify-center shrink-0 text-olive/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-[11px] tracking-[0.1em] text-olive/40 uppercase mb-0.5">{t.contact.hours}</p>
                  <p className="text-sm lg:text-base text-deep-forest">{t.contact.hoursValue}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
