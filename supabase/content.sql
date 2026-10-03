-- Run in Supabase SQL Editor (creates services + seeds news/services)

create table if not exists public.services (
  id text primary key,
  number text not null default '01',
  title text not null,
  title_ar text not null,
  description text not null default '',
  description_ar text not null default '',
  icon text not null default 'Building2',
  features text[] not null default '{}',
  features_ar text[] not null default '{}',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "Public read services" on public.services;
create policy "Public read services"
  on public.services for select using (published = true);

drop policy if exists "Auth write services" on public.services;
create policy "Auth write services"
  on public.services for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth read all news" on public.news;
create policy "Auth read all news"
  on public.news for select
  using (auth.role() = 'authenticated');

insert into public.news (
  slug, date_label, date_label_ar, category, category_ar,
  title, title_ar, description, description_ar, image_url, published
) values
(
  'campagne-nettoyage-el-alia',
  '15 Mars 2026', '15 مارس 2026',
  'Entretien', 'صيانة',
  'Campagne de nettoyage au cimetière d''El Alia',
  'حملة تنظيف بمقبرة العالية',
  'Une vaste opération de nettoyage et d''embellissement a été menée au cimetière d''El Alia mobilisant plus de 50 agents.',
  'تم تنفيذ عملية واسعة للتنظيف والتجميل بمقبرة العالية بمشاركة أكثر من 50 عونًا.',
  '', true
),
(
  'amenagement-sidi-mhamed',
  '2 Mars 2026', '2 مارس 2026',
  'Aménagement', 'تهيئة',
  'Aménagement paysager au cimetière de Sidi M''Hamed',
  'تهيئة المناظر الطبيعية بمقبرة سيدي امحمد',
  'Nouveaux espaces verts et allées paysagères au cimetière de Sidi M''Hamed dans le cadre du plan de modernisation.',
  'مساحات خضراء جديدة وممرات ذات مناظر طبيعية بمقبرة سيدي امحمد في إطار مخطط العصرنة.',
  '', true
),
(
  'extension-el-kettar',
  '20 Février 2026', '20 فيفري 2026',
  'Développement', 'تطوير',
  'Extension et amélioration des espaces du cimetière d''El Kettar',
  'توسيع وتحسين مساحات مقبرة القطار',
  'Lancement des travaux d''extension et d''amélioration des infrastructures au cimetière d''El Kettar.',
  'انطلاق أشغال توسيع وتحسين البنى التحتية بمقبرة القطار.',
  '', true
)
on conflict (slug) do nothing;

insert into public.services (
  id, number, title, title_ar, description, description_ar, icon, features, features_ar, sort_order
) values
(
  'gestion-cimetieres', '01',
  'Gestion des cimetières', 'تسيير المقابر',
  'Organisation, suivi et gestion administrative des cimetières.',
  'تنظيم ومتابعة وتسيير إداري للمقابر.',
  'Building2',
  array['Registre et suivi administratif','Gestion des concessions','Planification des espaces','Coordination avec les communes'],
  array['السجل والمتابعة الإدارية','تسيير الامتيازات','تخطيط المساحات','التنسيق مع البلديات'],
  1
),
(
  'proprete-entretien', '02',
  'Propreté & entretien', 'النظافة والصيانة',
  'Nettoyage, maintenance des allées, bâtiments et espaces verts.',
  'تنظيف وصيانة الممرات والمباني والمساحات الخضراء.',
  'Sparkles',
  array['Nettoyage quotidien des allées','Entretien des espaces verts','Maintenance des bâtiments','Gestion des déchets'],
  array['التنظيف اليومي للممرات','صيانة المساحات الخضراء','صيانة المباني','تسيير النفايات'],
  2
),
(
  'amenagement', '03',
  'Aménagement & développement', 'التهيئة والتطوير',
  'Extension, amélioration et aménagement des espaces.',
  'توسيع وتحسين وتهيئة المساحات.',
  'Trees',
  array['Extension des cimetières','Aménagement paysager','Modernisation des infrastructures','Création de nouveaux espaces'],
  array['توسيع المقابر','التهيئة الطبيعية','عصرنة البنى التحتية','إنشاء مساحات جديدة'],
  3
),
(
  'services-funeraires', '04',
  'Services funéraires', 'الخدمات الجنائزية',
  'Accompagnement et organisation des opérations funéraires.',
  'مرافقة وتنظيم العمليات الجنائزية.',
  'Heart',
  array['Accompagnement des familles','Organisation des inhumations','Coordination logistique','Service d''information'],
  array['مرافقة العائلات','تنظيم عمليات الدفن','التنسيق اللوجستي','خدمة المعلومات'],
  4
),
(
  'preservation', '05',
  'Préservation & respect', 'الحفظ والاحترام',
  'Protection de la mémoire et respect des lieux sacrés.',
  'حماية الذاكرة واحترام الأماكن المقدسة.',
  'Shield',
  array['Protection du patrimoine funéraire','Respect des traditions','Sensibilisation citoyenne','Préservation de la mémoire collective'],
  array['حماية التراث الجنائزي','احترام التقاليد','توعية المواطنين','الحفاظ على الذاكرة الجماعية'],
  5
)
on conflict (id) do nothing;
