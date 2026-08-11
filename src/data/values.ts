export interface Value {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  icon: string;
}

export const values: Value[] = [
  {
    id: 'service-public',
    title: 'Service public',
    titleAr: 'الخدمة العمومية',
    subtitle: 'Proximité et engagement.',
    subtitleAr: 'القرب والالتزام.',
    icon: 'Building2',
  },
  {
    id: 'respect',
    title: 'Respect',
    titleAr: 'الاحترام',
    subtitle: 'Préserver la dignité des lieux.',
    subtitleAr: 'الحفاظ على كرامة الأماكن.',
    icon: 'HandHeart',
  },
  {
    id: 'proprete',
    title: 'Propreté',
    titleAr: 'النظافة',
    subtitle: 'Maintenir des espaces propres et entretenus.',
    subtitleAr: 'الحفاظ على مساحات نظيفة ومعتنى بها.',
    icon: 'Sparkles',
  },
  {
    id: 'organisation',
    title: 'Organisation',
    titleAr: 'التنظيم',
    subtitle: 'Une gestion structurée et efficace.',
    subtitleAr: 'تسيير منظم وفعال.',
    icon: 'LayoutGrid',
  },
  {
    id: 'preservation',
    title: 'Préservation',
    titleAr: 'الحفظ',
    subtitle: 'Protéger le patrimoine et la mémoire collective.',
    subtitleAr: 'حماية التراث والذاكرة الجماعية.',
    icon: 'Shield',
  },
];
