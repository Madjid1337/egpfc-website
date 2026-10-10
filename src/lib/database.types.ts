export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
          unite_id: string | null;
          qr_code_url: string;
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
          unite_id?: string | null;
          qr_code_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          commune?: string;
          commune_ar?: string;
          wilaya?: string;
          address?: string;
          address_ar?: string;
          lat?: number;
          lng?: number;
          opening_hours?: string;
          opening_hours_ar?: string;
          hectares?: number;
          type?: 'islamique' | 'chrétien' | 'mixte';
          type_ar?: string;
          description?: string;
          description_ar?: string;
          image_url?: string;
          available?: boolean;
          unite_id?: string | null;
          qr_code_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Update: {
          id?: string;
          url?: string;
          kind?: 'hero' | 'gallery' | 'cemetery' | 'news';
          title?: string | null;
          sort_order?: number;
          cemetery_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'media_cemetery_id_fkey';
            columns: ['cemetery_id'];
            isOneToOne: false;
            referencedRelation: 'cemeteries';
            referencedColumns: ['id'];
          },
        ];
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
        Update: {
          id?: string;
          slug?: string;
          date_label?: string;
          date_label_ar?: string;
          category?: string;
          category_ar?: string;
          title?: string;
          title_ar?: string;
          description?: string;
          description_ar?: string;
          image_url?: string;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          number: string;
          title: string;
          title_ar: string;
          description: string;
          description_ar: string;
          icon: string;
          features: string[];
          features_ar: string[];
          sort_order: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          number?: string;
          title: string;
          title_ar: string;
          description?: string;
          description_ar?: string;
          icon?: string;
          features?: string[];
          features_ar?: string[];
          sort_order?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          title?: string;
          title_ar?: string;
          description?: string;
          description_ar?: string;
          icon?: string;
          features?: string[];
          features_ar?: string[];
          sort_order?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string;
          role: 'dev' | 'directeur' | 'chef_unite' | 'inventaire';
          unite_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string;
          role?: 'dev' | 'directeur' | 'chef_unite' | 'inventaire';
          unite_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          role?: 'dev' | 'directeur' | 'chef_unite' | 'inventaire';
          unite_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      unites: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          chef_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string;
          chef_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          chef_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          cemetery_id: string;
          issue_type: string;
          description: string;
          image_url: string;
          status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
          resolution_note: string;
          reporter_ip: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cemetery_id: string;
          issue_type: string;
          description: string;
          image_url?: string;
          status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
          resolution_note?: string;
          reporter_ip?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cemetery_id?: string;
          issue_type?: string;
          description?: string;
          image_url?: string;
          status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
          resolution_note?: string;
          reporter_ip?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          report_id: string;
          from_user_id: string | null;
          to_user_id: string;
          message: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          from_user_id?: string | null;
          to_user_id: string;
          message?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          from_user_id?: string | null;
          to_user_id?: string;
          message?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          cemetery_id: string | null;
          condition: 'bon' | 'pas_bon' | 'use';
          barcode: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          cemetery_id?: string | null;
          condition?: 'bon' | 'pas_bon' | 'use';
          barcode: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          cemetery_id?: string | null;
          condition?: 'bon' | 'pas_bon' | 'use';
          barcode?: string;
          notes?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_campaigns: {
        Row: {
          id: string;
          year: number;
          status: 'open' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          status?: 'open' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          status?: 'open' | 'closed';
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_teams: {
        Row: {
          id: string;
          campaign_id: string;
          team: number;
          user_id: string | null;
          full_name: string;
          email: string;
          temp_password: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          team: number;
          user_id?: string | null;
          full_name?: string;
          email: string;
          temp_password?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          team?: number;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          temp_password?: string;
        };
        Relationships: [];
      };
      inventory_counts: {
        Row: {
          id: string;
          campaign_id: string;
          item_id: string;
          team: number;
          condition: 'bon' | 'pas_bon' | 'use';
          counted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          item_id: string;
          team: number;
          condition: 'bon' | 'pas_bon' | 'use';
          counted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          item_id?: string;
          team?: number;
          condition?: 'bon' | 'pas_bon' | 'use';
          counted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_my_profile: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
      current_role: { Args: Record<string, never>; Returns: string };
      current_unite_id: { Args: Record<string, never>; Returns: string };
      is_directeur: { Args: Record<string, never>; Returns: boolean };
      is_staff_full: { Args: Record<string, never>; Returns: boolean };
      is_chef: { Args: Record<string, never>; Returns: boolean };
      inventory_list_unites: {
        Args: { p_email: string; p_password: string };
        Returns: { id: string; name: string; nameAr: string }[] | null;
      };
      inventory_team_login: {
        Args: { p_email: string; p_password: string };
        Returns: {
          teamId: string;
          team: number;
          fullName: string;
          email: string;
          campaignId: string;
          year: number;
        } | null;
      };
      inventory_item_by_barcode: {
        Args: { p_email: string; p_password: string; p_barcode: string };
        Returns: {
          id: string;
          name: string;
          category: string;
          cemeteryId: string | null;
          condition: 'bon' | 'pas_bon' | 'use';
          barcode: string;
        } | null;
      };
      inventory_item_counts: {
        Args: { p_email: string; p_password: string; p_item_id: string };
        Returns: { team: number; condition: 'bon' | 'pas_bon' | 'use' }[] | null;
      };
      inventory_submit_count: {
        Args: { p_email: string; p_password: string; p_item_id: string; p_condition: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
