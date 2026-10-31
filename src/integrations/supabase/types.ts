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
          garasi_path: string | null
          id: string
          ktp_path: string | null
          maps_url: string | null
          nama_lengkap: string
          nama_usaha: string
          nib: string | null
          no_anggota: string | null
          no_hp: string
          nomor_anggota: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["status_anggota"]
          unit: Json
          user_id: string | null
          wilayah: string
        }
        Insert: {
          created_at?: string
          garasi_path?: string | null
          id?: string
          ktp_path?: string | null
          maps_url?: string | null
          nama_lengkap: string
          nama_usaha: string
          nib?: string | null
          no_anggota?: string | null
          no_hp?: string
          nomor_anggota: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_anggota"]
          unit?: Json
          user_id?: string | null
          wilayah: string
        }
        Update: {
          created_at?: string
          garasi_path?: string | null
          id?: string
          ktp_path?: string | null
          maps_url?: string | null
          nama_lengkap?: string
          nama_usaha?: string
          nib?: string | null
          no_anggota?: string | null
          no_hp?: string
          nomor_anggota?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_anggota"]
          unit?: Json
          user_id?: string | null
          wilayah?: string
        }
        Relationships: []
      }
      artikel: {
        Row: {
          created_at: string
          gambar: string | null
          id: string
          isi: string
          judul: string
          ringkasan: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          tanggal: string
          terbit: boolean
        }
        Insert: {
          created_at?: string
          gambar?: string | null
          id?: string
          isi?: string
          judul: string
          ringkasan?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tanggal?: string
          terbit?: boolean
        }
        Update: {
          created_at?: string
          gambar?: string | null
          id?: string
          isi?: string
          judul?: string
          ringkasan?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tanggal?: string
          terbit?: boolean
        }
        Relationships: []
      }
      blacklist: {
        Row: {
          bukti: Json
          id: string
          input_by: string
          keterangan: string
          nama_konsumen: string
          nik: string | null
          no_hp_konsumen: string | null
          riwayat_kasus: Json
          tanggal_input: string
          tanggal_kejadian: string | null
          wilayah: string
        }
        Insert: {
          bukti?: Json
          id?: string
          input_by: string
          keterangan: string
          nama_konsumen: string
          nik?: string | null
          no_hp_konsumen?: string | null
          riwayat_kasus?: Json
          tanggal_input?: string
          tanggal_kejadian?: string | null
          wilayah: string
        }
        Update: {
          bukti?: Json
          id?: string
          input_by?: string
          keterangan?: string
          nama_konsumen?: string
          nik?: string | null
          no_hp_konsumen?: string | null
          riwayat_kasus?: Json
          tanggal_input?: string
          tanggal_kejadian?: string | null
          wilayah?: string
        }
        Relationships: []
      }
      galeri: {
        Row: {
          created_at: string
          gambar: string
          id: string
          judul: string
          urutan: number
        }
        Insert: {
          created_at?: string
          gambar: string
          id?: string
          judul?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          gambar?: string
          id?: string
          judul?: string
          urutan?: number
        }
        Relationships: []
      }
      halaman: {
        Row: {
          hero_desc: string | null
          hero_eyebrow: string | null
          hero_image: string | null
          hero_title: string | null
          konten: Json
          og_image: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          hero_desc?: string | null
          hero_eyebrow?: string | null
          hero_image?: string | null
          hero_title?: string | null
          konten?: Json
          og_image?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          hero_desc?: string | null
          hero_eyebrow?: string | null
          hero_image?: string | null
          hero_title?: string | null
          konten?: Json
          og_image?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      kegiatan: {
        Row: {
          alamat: string | null
          created_at: string
          deskripsi: string
          dokumentasi: Json
          foto: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_kegiatan"]
          judul: string
          lokasi: string
          maps_url: string | null
          narahubung: string | null
          penyelenggara: string | null
          tanggal: string
          waktu: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          deskripsi: string
          dokumentasi?: Json
          foto?: string
          id?: string
          jenis: Database["public"]["Enums"]["jenis_kegiatan"]
          judul: string
          lokasi: string
          maps_url?: string | null
          narahubung?: string | null
          penyelenggara?: string | null
          tanggal: string
          waktu?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          deskripsi?: string
          dokumentasi?: Json
          foto?: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_kegiatan"]
          judul?: string
          lokasi?: string
          maps_url?: string | null
          narahubung?: string | null
          penyelenggara?: string | null
          tanggal?: string
          waktu?: string | null
        }
        Relationships: []
      }
      pendaftaran: {
        Row: {
          created_at: string
          id: string
          jumlah_unit: number | null
          nama: string
          nama_usaha: string
          no_hp: string
          pesan: string | null
          status: string
          wilayah: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah_unit?: number | null
          nama: string
          nama_usaha: string
          no_hp: string
          pesan?: string | null
          status?: string
          wilayah: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah_unit?: number | null
          nama?: string
          nama_usaha?: string
          no_hp?: string
          pesan?: string | null
          status?: string
          wilayah?: string
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
      surat_keputusan: {
        Row: {
          anggota_id: string | null
          created_at: string
          created_by: string | null
          diktum_lain: Json
          ditetapkan_di: string
          id: string
          jabatan: string
          jabatan_penandatangan: string
          kode: string
          mengingat: Json
          menimbang: Json
          nama_penandatangan: string
          nama_penerima: string
          nomor: string
          status: string
          tanggal_ditetapkan: string
          tentang: string
          tingkat: string
          ttd_url: string | null
          updated_at: string
        }
        Insert: {
          anggota_id?: string | null
          created_at?: string
          created_by?: string | null
          diktum_lain?: Json
          ditetapkan_di?: string
          id?: string
          jabatan: string
          jabatan_penandatangan?: string
          kode?: string
          mengingat?: Json
          menimbang?: Json
          nama_penandatangan: string
          nama_penerima: string
          nomor: string
          status?: string
          tanggal_ditetapkan?: string
          tentang?: string
          tingkat?: string
          ttd_url?: string | null
          updated_at?: string
        }
        Update: {
          anggota_id?: string | null
          created_at?: string
          created_by?: string | null
          diktum_lain?: Json
          ditetapkan_di?: string
          id?: string
          jabatan?: string
          jabatan_penandatangan?: string
          kode?: string
          mengingat?: Json
          menimbang?: Json
          nama_penandatangan?: string
          nama_penerima?: string
          nomor?: string
          status?: string
          tanggal_ditetapkan?: string
          tentang?: string
          tingkat?: string
          ttd_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surat_keputusan_anggota_id_fkey"
            columns: ["anggota_id"]
            isOneToOne: false
            referencedRelation: "anggota"
            referencedColumns: ["id"]
          },
        ]
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
      detail_blacklist: {
        Args: { _id: string }
        Returns: {
          bukti: Json
          id: string
          keterangan: string
          nama_konsumen: string
          nik: string
          no_hp_konsumen: string
          riwayat_kasus: Json
          tanggal_input: string
          tanggal_kejadian: string
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
      verifikasi_sk: {
        Args: { _kode: string }
        Returns: {
          diktum_lain: Json
          ditetapkan_di: string
          jabatan: string
          jabatan_penandatangan: string
          kode: string
          mengingat: Json
          menimbang: Json
          nama_penandatangan: string
          nama_penerima: string
          nomor: string
          status: string
          tanggal_ditetapkan: string
          tentang: string
          tingkat: string
          ttd_url: string
          updated_at: string
        }[]
      }
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
