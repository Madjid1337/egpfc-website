export type Lang = 'fr' | 'ar';

export interface Translations {
  nav: {
    home: string;
    establishment: string;
    services: string;
    cemeteries: string;
    news: string;
    contact: string;
    langSwitch: string;
    menu: string;
    close: string;
  };
  hero: {
    label: string;
    heading1: string;
    heading2: string;
    description: string;
    cta1: string;
    cta2: string;
    scroll: string;
  };
  about: {
    label: string;
    heading: string;
    description: string;
    cta: string;
  };
  values: {
    heading: string;
    subtitle: string;
  };
  services: {
    heading: string;
    subtitle: string;
    discover: string;
  };
  cemeteries: {
    heading: string;
    subtitle: string;
    explore: string;
    managed: string;
    communes: string;
    hectares: string;
    agents: string;
    search: string;
    searchPlaceholder: string;
    filterCommune: string;
    filterType: string;
    filterAvailability: string;
    viewDetails: string;
    openMap: string;
    noResults: string;
    allCommunes: string;
    allTypes: string;
    all: string;
    available: string;
    unavailable: string;
    openingHours: string;
    address: string;
    commune: string;
    type: string;
  };
  news: {
    heading: string;
    readMore: string;
  };
  gallery: {
    heading: string;
  };
  mission: {
    heading: string;
    description: string;
  };
  contact: {
    heading: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    hoursValue: string;
    formName: string;
    formEmail: string;
    formPhone: string;
    formSubject: string;
    formMessage: string;
    formSubmit: string;
    success: string;
  };
  footer: {
    description: string;
    navigation: string;
    services: string;
    legal: string;
    privacy: string;
    sitemap: string;
    accessibility: string;
    copyright: string;
  };
}

const fr: Translations = {
  nav: {
    home: 'Accueil',
    establishment: 'L\'établissement',
    services: 'Nos services',
    cemeteries: 'Cimetières',
    news: 'Actualités',
    contact: 'Contact',
    langSwitch: 'AR',
    menu: 'Menu',
    close: 'Fermer',
  },
  hero: {
    label: 'ÉTABLISSEMENT PUBLIC À CARACTÈRE INDUSTRIEL ET COMMERCIAL',
    heading1: 'PRÉSERVER LES LIEUX,',
    heading2: 'RESPECTER LA MÉMOIRE',
    description: 'Une mission publique au service de la dignité, de l\'hygiène et de la mémoire collective.',
    cta1: 'DÉCOUVRIR NOS SERVICES',
    cta2: 'EXPLORER LES CIMETIÈRES',
    scroll: 'Défiler',
  },
  about: {
    label: 'À PROPOS DE L\'EGPFC',
    heading: 'Une institution au service des lieux et de la mémoire.',
    description: 'L\'Établissement de Gestion des Pompes Funèbres et des Cimetières de la Wilaya d\'Alger est un établissement public à caractère industriel et commercial. Sa mission est d\'assurer la gestion professionnelle, l\'entretien, l\'organisation et la préservation des cimetières et des services funéraires dans le respect de la dignité des lieux et des citoyens.',
    cta: 'EN SAVOIR PLUS',
  },
  values: {
    heading: 'Nos valeurs',
    subtitle: 'Les principes qui guident notre action quotidienne.',
  },
  services: {
    heading: 'Nos services',
    subtitle: 'Une gestion complète au service des citoyens et des lieux.',
    discover: 'Découvrir',
  },
  cemeteries: {
    heading: 'Nos cimetières',
    subtitle: 'Découvrez les cimetières gérés par l\'EGPFC à travers la Wilaya d\'Alger.',
    explore: 'EXPLORER LA CARTE',
    managed: 'Cimetières gérés',
    communes: 'Communes couvertes',
    hectares: 'Hectares entretenus',
    agents: 'Agents mobilisés',
    search: 'TROUVER UN CIMETIÈRE',
    searchPlaceholder: 'Rechercher un cimetière...',
    filterCommune: 'Commune',
    filterType: 'Type',
    filterAvailability: 'Disponibilité',
    viewDetails: 'Voir la fiche',
    openMap: 'Voir sur Google Maps',
    noResults: 'Aucun cimetière trouvé.',
    allCommunes: 'Toutes les communes',
    allTypes: 'Tous les types',
    all: 'Tous',
    available: 'Disponible',
    unavailable: 'Indisponible',
    openingHours: 'Horaires d\'ouverture',
    address: 'Adresse',
    commune: 'Commune',
    type: 'Type',
  },
  news: {
    heading: 'Actualités',
    readMore: 'Lire plus',
  },
  gallery: {
    heading: 'Notre activité sur le terrain',
  },
  mission: {
    heading: 'Notre mission',
    description: 'Préserver des lieux propres, organisés et respectés, tout en assurant un service public digne et efficace.',
  },
  contact: {
    heading: 'Nous contacter',
    address: '[ADRESSE DU SIÈGE EGPFC]',
    phone: '[NUMÉRO DE TÉLÉPHONE]',
    email: '[EMAIL OFFICIEL]',
    hours: 'Horaires d\'ouverture',
    hoursValue: 'Dimanche – Jeudi : 08:00 – 16:30',
    formName: 'Nom complet',
    formEmail: 'Email',
    formPhone: 'Téléphone',
    formSubject: 'Sujet',
    formMessage: 'Message',
    formSubmit: 'ENVOYER LE MESSAGE',
    success: 'Votre message a été envoyé avec succès.',
  },
  footer: {
    description: 'Établissement public chargé de la gestion, de l\'entretien et de la préservation des cimetières et des services funéraires de la Wilaya d\'Alger.',
    navigation: 'Navigation',
    services: 'Services',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    sitemap: 'Plan du site',
    accessibility: 'Accessibilité',
    copyright: '© EGPFC — Tous droits réservés.',
  },
};

const ar: Translations = {
  nav: {
    home: 'الرئيسية',
    establishment: 'المؤسسة',
    services: 'خدماتنا',
    cemeteries: 'المقابر',
    news: 'الأخبار',
    contact: 'اتصل بنا',
    langSwitch: 'FR',
    menu: 'القائمة',
    close: 'إغلاق',
  },
  hero: {
    label: 'مؤسسة عمومية ذات طابع صناعي وتجاري',
    heading1: 'نحافظ على المكان،',
    heading2: 'ونحترم الذاكرة',
    description: 'مهمة عمومية في خدمة الكرامة والنظافة والذاكرة الجماعية.',
    cta1: 'اكتشف خدماتنا',
    cta2: 'استكشف المقابر',
    scroll: 'اسحب',
  },
  about: {
    label: 'عن المؤسسة',
    heading: 'مؤسسة في خدمة الأماكن والذاكرة.',
    description: 'مؤسسة تسيير الجنائز والمقابر لولاية الجزائر هي مؤسسة عمومية ذات طابع صناعي وتجاري. مهمتها ضمان التسيير المهني وصيانة وتنظيم وحفظ المقابر والخدمات الجنائزية مع احترام كرامة الأماكن والمواطنين.',
    cta: 'اقرأ المزيد',
  },
  values: {
    heading: 'قيمنا',
    subtitle: 'المبادئ التي توجه عملنا اليومي.',
  },
  services: {
    heading: 'خدماتنا',
    subtitle: 'تسيير شامل في خدمة المواطنين والأماكن.',
    discover: 'اكتشف',
  },
  cemeteries: {
    heading: 'مقابرنا',
    subtitle: 'اكتشف المقابر التي تسيرها المؤسسة عبر ولاية الجزائر.',
    explore: 'استكشف الخريطة',
    managed: 'مقبرة مُسيَّرة',
    communes: 'بلدية مغطاة',
    hectares: 'هكتار تمت صيانتها',
    agents: 'عون مجند',
    search: 'البحث عن مقبرة',
    searchPlaceholder: 'ابحث عن مقبرة...',
    filterCommune: 'البلدية',
    filterType: 'النوع',
    filterAvailability: 'التوفر',
    viewDetails: 'عرض البطاقة',
    openMap: 'عرض في خرائط Google',
    noResults: 'لم يتم العثور على مقبرة.',
    allCommunes: 'جميع البلديات',
    allTypes: 'جميع الأنواع',
    all: 'الكل',
    available: 'متاح',
    unavailable: 'غير متاح',
    openingHours: 'أوقات العمل',
    address: 'العنوان',
    commune: 'البلدية',
    type: 'النوع',
  },
  news: {
    heading: 'الأخبار',
    readMore: 'اقرأ المزيد',
  },
  gallery: {
    heading: 'نشاطنا في الميدان',
  },
  mission: {
    heading: 'مهمتنا',
    description: 'الحفاظ على أماكن نظيفة ومنظمة ومحترمة، مع ضمان خدمة عمومية كريمة وفعالة.',
  },
  contact: {
    heading: 'اتصل بنا',
    address: '[عنوان المقر]',
    phone: '[رقم الهاتف]',
    email: '[البريد الإلكتروني الرسمي]',
    hours: 'أوقات العمل',
    hoursValue: 'الأحد – الخميس : 08:00 – 16:30',
    formName: 'الاسم الكامل',
    formEmail: 'البريد الإلكتروني',
    formPhone: 'الهاتف',
    formSubject: 'الموضوع',
    formMessage: 'الرسالة',
    formSubmit: 'إرسال الرسالة',
    success: 'تم إرسال رسالتك بنجاح.',
  },
  footer: {
    description: 'مؤسسة عمومية مكلفة بتسيير وصيانة وحفظ المقابر والخدمات الجنائزية لولاية الجزائر.',
    navigation: 'تصفح',
    services: 'الخدمات',
    legal: 'إشعارات قانونية',
    privacy: 'سياسة الخصوصية',
    sitemap: 'خريطة الموقع',
    accessibility: 'إمكانية الوصول',
    copyright: '© المؤسسة — جميع الحقوق محفوظة.',
  },
};

export const translations: Record<Lang, Translations> = { fr, ar };
