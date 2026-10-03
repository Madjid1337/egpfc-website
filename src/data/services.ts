export interface Service {
  id: string;
  number: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  features: string[];
  featuresAr: string[];
  sortOrder?: number;
  published?: boolean;
}

export const services: Service[] = [
  {
    id: 'gestion-cimetieres',
    number: '01',
    title: 'Gestion des cimetières',
    titleAr: 'تسيير المقابر',
    description: 'Organisation, suivi et gestion administrative des cimetières.',
    descriptionAr: 'تنظيم ومتابعة وتسيير إداري للمقابر.',
    icon: 'Building2',
    features: [
      'Registre et suivi administratif',
      'Gestion des concessions',
      'Planification des espaces',
      'Coordination avec les communes',
    ],
    featuresAr: [
      'السجل والمتابعة الإدارية',
      'تسيير الامتيازات',
      'تخطيط المساحات',
      'التنسيق مع البلديات',
    ],
  },
  {
    id: 'proprete-entretien',
    number: '02',
    title: 'Propreté & entretien',
    titleAr: 'النظافة والصيانة',
    description: 'Nettoyage, maintenance des allées, bâtiments et espaces verts.',
    descriptionAr: 'تنظيف وصيانة الممرات والمباني والمساحات الخضراء.',
    icon: 'Sparkles',
    features: [
      'Nettoyage quotidien des allées',
      'Entretien des espaces verts',
      'Maintenance des bâtiments',
      'Gestion des déchets',
    ],
    featuresAr: [
      'التنظيف اليومي للممرات',
      'صيانة المساحات الخضراء',
      'صيانة المباني',
      'تسيير النفايات',
    ],
  },
  {
    id: 'amenagement',
    number: '03',
    title: 'Aménagement & développement',
    titleAr: 'التهيئة والتطوير',
    description: 'Extension, amélioration et aménagement des espaces.',
    descriptionAr: 'توسيع وتحسين وتهيئة المساحات.',
    icon: 'Trees',
    features: [
      'Extension des cimetières',
      'Aménagement paysager',
      'Modernisation des infrastructures',
      'Création de nouveaux espaces',
    ],
    featuresAr: [
      'توسيع المقابر',
      'التهيئة الطبيعية',
      'عصرنة البنى التحتية',
      'إنشاء مساحات جديدة',
    ],
  },
  {
    id: 'services-funeraires',
    number: '04',
    title: 'Services funéraires',
    titleAr: 'الخدمات الجنائزية',
    description: 'Accompagnement et organisation des opérations funéraires.',
    descriptionAr: 'مرافقة وتنظيم العمليات الجنائزية.',
    icon: 'Heart',
    features: [
      'Accompagnement des familles',
      'Organisation des inhumations',
      'Coordination logistique',
      'Service d\'information',
    ],
    featuresAr: [
      'مرافقة العائلات',
      'تنظيم عمليات الدفن',
      'التنسيق اللوجستي',
      'خدمة المعلومات',
    ],
  },
  {
    id: 'preservation',
    number: '05',
    title: 'Préservation & respect',
    titleAr: 'الحفظ والاحترام',
    description: 'Protection de la mémoire et respect des lieux sacrés.',
    descriptionAr: 'حماية الذاكرة واحترام الأماكن المقدسة.',
    icon: 'Shield',
    features: [
      'Protection du patrimoine funéraire',
      'Respect des traditions',
      'Sensibilisation citoyenne',
      'Préservation de la mémoire collective',
    ],
    featuresAr: [
      'حماية التراث الجنائزي',
      'احترام التقاليد',
      'توعية المواطنين',
      'الحفاظ على الذاكرة الجماعية',
    ],
  },
];
