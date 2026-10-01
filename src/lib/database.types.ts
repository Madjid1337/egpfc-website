export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cemeteries: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          commune: string;
          commune_ar: string;
          wilaya: string;
          address: string;
          address_ar: string;
          lat: number;
          lng: number;
          opening_hours: string;
          opening_hours_ar: string;
          hectares: number;
          type: 'islamique' | 'chrétien' | 'mixte';
          type_ar: string;
          description: string;
          description_ar: string;
          image_url: string;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_ar: string;
          commune: string;
          commune_ar: string;
          wilaya?: string;
          address: string;
          address_ar: string;
          lat: number;
          lng: number;
          opening_hours: string;
          opening_hours_ar: string;
          hectares?: number;
          type: 'islamique' | 'chrétien' | 'mixte';
          type_ar: string;
          description?: string;
          description_ar?: string;
          image_url?: string;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['cemeteries']['Insert']>;
      };
      media: {
        Row: {
          id: string;
          url: string;
          kind: 'hero' | 'gallery' | 'cemetery' | 'news';
          title: string | null;
          sort_order: number;
          cemetery_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          kind: 'hero' | 'gallery' | 'cemetery' | 'news';
          title?: string | null;
          sort_order?: number;
          cemetery_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
      };
      news: {
        Row: {
          id: string;
          slug: string;
          date_label: string;
          date_label_ar: string;
          category: string;
          category_ar: string;
          title: string;
          title_ar: string;
          description: string;
          description_ar: string;
          image_url: string;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          date_label: string;
          date_label_ar: string;
          category: string;
          category_ar: string;
          title: string;
          title_ar: string;
          description: string;
          description_ar: string;
          image_url?: string;
          published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['news']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
