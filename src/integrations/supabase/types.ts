export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      driver_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          license_number: string
          vehicle_color: string
          vehicle_model: string
          vehicle_number: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string | null
          id: string
          is_available?: boolean | null
          is_verified?: boolean | null
          license_number: string
          vehicle_color: string
          vehicle_model: string
          vehicle_number: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          license_number?: string
          vehicle_color?: string
          vehicle_model?: string
          vehicle_number?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"]
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          rating?: number | null
          role: Database["public"]["Enums"]["user_role"]
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ride_locations: {
        Row: {
          driver_id: string
          id: string
          latitude: number
          longitude: number
          ride_id: string
          timestamp: string | null
        }
        Insert: {
          driver_id: string
          id?: string
          latitude: number
          longitude: number
          ride_id: string
          timestamp?: string | null
        }
        Update: {
          driver_id?: string
          id?: string
          latitude?: number
          longitude?: number
          ride_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_locations_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string | null
          destination_location: Json
          expires_at: string | null
          id: string
          max_price: number | null
          passenger_id: string
          pickup_location: Json
          pickup_time: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          destination_location: Json
          expires_at?: string | null
          id?: string
          max_price?: number | null
          passenger_id: string
          pickup_location: Json
          pickup_time: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          destination_location?: Json
          expires_at?: string | null
          id?: string
          max_price?: number | null
          passenger_id?: string
          pickup_location?: Json
          pickup_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          actual_distance: number | null
          actual_price: number | null
          completed_at: string | null
          created_at: string | null
          destination_location: Json
          driver_feedback: string | null
          driver_id: string | null
          driver_rating: number | null
          estimated_distance: number | null
          estimated_price: number | null
          id: string
          passenger_feedback: string | null
          passenger_id: string
          passenger_rating: number | null
          pickup_location: Json
          pickup_time: string
          status: Database["public"]["Enums"]["ride_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_distance?: number | null
          actual_price?: number | null
          completed_at?: string | null
          created_at?: string | null
          destination_location: Json
          driver_feedback?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_distance?: number | null
          estimated_price?: number | null
          id?: string
          passenger_feedback?: string | null
          passenger_id: string
          passenger_rating?: number | null
          pickup_location: Json
          pickup_time: string
          status?: Database["public"]["Enums"]["ride_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_distance?: number | null
          actual_price?: number | null
          completed_at?: string | null
          created_at?: string | null
          destination_location?: Json
          driver_feedback?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          estimated_distance?: number | null
          estimated_price?: number | null
          id?: string
          passenger_feedback?: string | null
          passenger_id?: string
          passenger_rating?: number | null
          pickup_location?: Json
          pickup_time?: string
          status?: Database["public"]["Enums"]["ride_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ride_price: {
        Args: { distance_km: number }
        Returns: number
      }
    }
    Enums: {
      ride_status:
        | "pending"
        | "matched"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "driver" | "passenger"
      vehicle_type: "sedan" | "suv" | "hatchback" | "motorcycle"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ride_status: [
        "pending",
        "matched",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["driver", "passenger"],
      vehicle_type: ["sedan", "suv", "hatchback", "motorcycle"],
    },
  },
} as const
