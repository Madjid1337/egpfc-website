import type { Cemetery } from '@/data/cemeteries';

export type UserRole = 'dev' | 'directeur' | 'chef_unite' | 'inventaire';

export const FULL_ACCESS_ROLES: UserRole[] = ['dev', 'directeur'];

export function hasFullAccess(role: UserRole | null | undefined): boolean {
  return role === 'dev' || role === 'directeur';
}

export type Profile = {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  uniteId: string | null;
};

export type Unite = {
  id: string;
  name: string;
  nameAr: string;
  chefUserId: string | null;
};

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type Report = {
  id: string;
  cemeteryId: string;
  cemeteryName?: string;
  issueType: string;
  description: string;
  imageUrl: string;
  status: ReportStatus;
  resolutionNote: string;
  createdAt: string;
  updatedAt: string;
};

export type Alert = {
  id: string;
  reportId: string;
  fromUserId: string | null;
  toUserId: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export const ISSUE_TYPES = [
  { value: 'proprete', label: 'Propreté / nettoyage' },
  { value: 'degat', label: 'Dégât / vandalisme' },
  { value: 'entretien', label: 'Entretien / maintenance' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'autre', label: 'Autre' },
] as const;

export type CemeteryOps = Cemetery & {
  uniteId?: string | null;
  qrCodeUrl?: string;
};
