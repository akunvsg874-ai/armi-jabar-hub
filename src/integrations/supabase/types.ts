export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      anggota: {
        Row: {
          created_at: string
          id: string
          nama_lengkap: string
          nama_usaha: string
          no_hp: string
          nomor_anggota: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["status_anggota"]
          user_id: string | null
          wilayah: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama_lengkap: string
          nama_usaha: string
          no_hp: string
          nomor_anggota: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_anggota"]
          user_id?: string | null
          wilayah: string
        }
        Update: {
          created_at?: string
          id?: string
          nama_lengkap?: string
          nama_usaha?: string
          no_hp?: string
          nomor_anggota?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_anggota"]
          user_id?: string | null
          wilayah?: string
        }
        Relationships: []
      }
      blacklist: {
        Row: {
          id: string
          input_by: string
          keterangan: string
          nama_konsumen: string
          nik: string | null
          no_hp_konsumen: string | null
          tanggal_input: string
          wilayah: string
        }
        Insert: {
          id?: string
          input_by: string
          keterangan: string
          nama_konsumen: string
          nik?: string | null
          no_hp_konsumen?: string | null
          tanggal_input?: string
          wilayah: string
        }
        Update: {
          id?: string
          input_by?: string
          keterangan?: string
          nama_konsumen?: string
          nik?: string | null
          no_hp_konsumen?: string | null
          tanggal_input?: string
          wilayah?: string
        }
        Relationships: []
      }
      kegiatan: {
        Row: {
          created_at: string
          deskripsi: string
          foto: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_kegiatan"]
          judul: string
          lokasi: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          deskripsi: string
          foto?: string
          id?: string
          jenis: Database["public"]["Enums"]["jenis_kegiatan"]
          judul: string
          lokasi: string
          tanggal: string
        }
        Update: {
          created_at?: string
          deskripsi?: string
          foto?: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_kegiatan"]
          judul?: string
          lokasi?: string
          tanggal?: string
        }
        Relationships: []
      }
      sub_kategori: {
        Row: {
          id: string
          kategori: Database["public"]["Enums"]["kategori_keuangan"]
          nama: string
        }
        Insert: {
          id?: string
          kategori: Database["public"]["Enums"]["kategori_keuangan"]
          nama: string
        }
        Update: {
          id?: string
          kategori?: Database["public"]["Enums"]["kategori_keuangan"]
          nama?: string
        }
        Relationships: []
      }
      transaksi: {
        Row: {
          created_at: string
          id: string
          input_by: string
          kategori: Database["public"]["Enums"]["kategori_keuangan"]
          keterangan: string | null
          nominal: number
          sub_kategori: string
          tanggal: string
          tipe: Database["public"]["Enums"]["tipe_transaksi"]
        }
        Insert: {
          created_at?: string
          id?: string
          input_by: string
          kategori: Database["public"]["Enums"]["kategori_keuangan"]
          keterangan?: string | null
          nominal: number
          sub_kategori: string
          tanggal?: string
          tipe: Database["public"]["Enums"]["tipe_transaksi"]
        }
        Update: {
          created_at?: string
          id?: string
          input_by?: string
          kategori?: Database["public"]["Enums"]["kategori_keuangan"]
          keterangan?: string | null
          nominal?: number
          sub_kategori?: string
          tanggal?: string
          tipe?: Database["public"]["Enums"]["tipe_transaksi"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cari_anggota_publik: {
        Args: { q: string }
        Returns: {
          nama_lengkap: string
          nama_usaha: string
          nomor_anggota: string
          status: Database["public"]["Enums"]["status_anggota"]
          wilayah: string
        }[]
      }
      cari_blacklist: {
        Args: { q: string }
        Returns: {
          id: string
          keterangan: string
          nama_konsumen: string
          tanggal_input: string
          wilayah: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_nomor_anggota: { Args: never; Returns: string }
      peek_nomor_anggota: { Args: never; Returns: string }
      statistik_publik: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "bendahara" | "anggota"
      jenis_kegiatan: "SOSIAL" | "KOPDAR" | "EKSEKUSI" | "ANNIVERSARY"
      kategori_keuangan:
        | "KAS"
        | "KEORGANISASIAN"
        | "KOMUNITAS"
        | "SUMBANGAN_SOSIAL"
      status_anggota: "aktif" | "non_aktif"
      tipe_transaksi: "pemasukan" | "pengeluaran"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "bendahara", "anggota"],
      jenis_kegiatan: ["SOSIAL", "KOPDAR", "EKSEKUSI", "ANNIVERSARY"],
      kategori_keuangan: [
        "KAS",
        "KEORGANISASIAN",
        "KOMUNITAS",
        "SUMBANGAN_SOSIAL",
      ],
      status_anggota: ["aktif", "non_aktif"],
      tipe_transaksi: ["pemasukan", "pengeluaran"],
    },
  },
} as const
