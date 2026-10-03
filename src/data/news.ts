export interface NewsItem {
  id: string;
  date: string;
  dateAr: string;
  category: string;
  categoryAr: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  slug: string;
  published?: boolean;
}

export const newsItems: NewsItem[] = [
  {
    id: '1',
    date: '15 Mars 2026',
    dateAr: '15 مارس 2026',
    category: 'Entretien',
    categoryAr: 'صيانة',
    title: 'Campagne de nettoyage au cimetière d\'El Alia',
    titleAr: 'حملة تنظيف بمقبرة العالية',
    description: 'Une vaste opération de nettoyage et d\'embellissement a été menée au cimetière d\'El Alia mobilisant plus de 50 agents.',
    descriptionAr: 'تم تنفيذ عملية واسعة للتنظيف والتجميل بمقبرة العالية بمشاركة أكثر من 50 عونًا.',
    imageUrl: '',
    slug: 'campagne-nettoyage-el-alia',
  },
  {
    id: '2',
    date: '2 Mars 2026',
    dateAr: '2 مارس 2026',
    category: 'Aménagement',
    categoryAr: 'تهيئة',
    title: 'Aménagement paysager au cimetière de Sidi M\'Hamed',
    titleAr: 'تهيئة المناظر الطبيعية بمقبرة سيدي امحمد',
    description: 'Nouveaux espaces verts et allées paysagères au cimetière de Sidi M\'Hamed dans le cadre du plan de modernisation.',
    descriptionAr: 'مساحات خضراء جديدة وممرات ذات مناظر طبيعية بمقبرة سيدي امحمد في إطار مخطط العصرنة.',
    imageUrl: '',
    slug: 'amenagement-sidi-mhamed',
  },
  {
    id: '3',
    date: '20 Février 2026',
    dateAr: '20 فيفري 2026',
    category: 'Développement',
    categoryAr: 'تطوير',
    title: 'Extension et amélioration des espaces du cimetière d\'El Kettar',
    titleAr: 'توسيع وتحسين مساحات مقبرة القطار',
    description: 'Lancement des travaux d\'extension et d\'amélioration des infrastructures au cimetière d\'El Kettar.',
    descriptionAr: 'انطلاق أشغال توسيع وتحسين البنى التحتية بمقبرة القطار.',
    imageUrl: '',
    slug: 'extension-el-kettar',
  },
];
