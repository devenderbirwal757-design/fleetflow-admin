export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "SUPER_ADMIN" | "OPERATOR";
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email: string;
          role?: "SUPER_ADMIN" | "OPERATOR";
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "SUPER_ADMIN" | "OPERATOR";
          phone?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          license_number: string;
          license_expiry: string;
          address: string | null;
          joining_date: string;
          salary_type: "fixed" | "per_trip" | "percentage";
          status: "available" | "on_trip" | "off_duty" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          license_number: string;
          license_expiry: string;
          address?: string | null;
          joining_date?: string;
          salary_type?: "fixed" | "per_trip" | "percentage";
          status?: "available" | "on_trip" | "off_duty" | "inactive";
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          license_number?: string;
          license_expiry?: string;
          address?: string | null;
          joining_date?: string;
          salary_type?: "fixed" | "per_trip" | "percentage";
          status?: "available" | "on_trip" | "off_duty" | "inactive";
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          vehicle_number: string;
          vehicle_type: "sedan" | "suv" | "hatchback" | "van" | "bus" | "other";
          brand_model: string;
          seating_capacity: number;
          fuel_type: "petrol" | "diesel" | "cng" | "electric" | "other";
          insurance_expiry: string;
          permit_expiry: string | null;
          rc_number: string | null;
          fitness_expiry: string | null;
          status: "available" | "on_trip" | "maintenance" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_number: string;
          vehicle_type?: "sedan" | "suv" | "hatchback" | "van" | "bus" | "other";
          brand_model: string;
          seating_capacity?: number;
          fuel_type?: "petrol" | "diesel" | "cng" | "electric" | "other";
          insurance_expiry: string;
          permit_expiry?: string | null;
          rc_number?: string | null;
          fitness_expiry?: string | null;
          status?: "available" | "on_trip" | "maintenance" | "inactive";
        };
        Update: {
          id?: string;
          vehicle_number?: string;
          vehicle_type?: "sedan" | "suv" | "hatchback" | "van" | "bus" | "other";
          brand_model?: string;
          seating_capacity?: number;
          fuel_type?: "petrol" | "diesel" | "cng" | "electric" | "other";
          insurance_expiry?: string;
          permit_expiry?: string | null;
          rc_number?: string | null;
          fitness_expiry?: string | null;
          status?: "available" | "on_trip" | "maintenance" | "inactive";
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          pickup_location: string;
          drop_location: string;
          trip_date: string;
          trip_time: string | null;
          trip_type: "one_way" | "round_trip" | "airport" | "rental";
          driver_id: string | null;
          vehicle_id: string | null;
          status: "pending" | "assigned" | "started" | "completed" | "cancelled";
          total_amount: number | null;
          advance_amount: number;
          notes: string | null;
          special_requirements: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          pickup_location: string;
          drop_location: string;
          trip_date: string;
          trip_time?: string | null;
          trip_type?: "one_way" | "round_trip" | "airport" | "rental";
          driver_id?: string | null;
          vehicle_id?: string | null;
          status?: "pending" | "assigned" | "started" | "completed" | "cancelled";
          total_amount?: number | null;
          advance_amount?: number;
          notes?: string | null;
          special_requirements?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          pickup_location?: string;
          drop_location?: string;
          trip_date?: string;
          trip_time?: string | null;
          trip_type?: "one_way" | "round_trip" | "airport" | "rental";
          driver_id?: string | null;
          vehicle_id?: string | null;
          status?: "pending" | "assigned" | "started" | "completed" | "cancelled";
          total_amount?: number | null;
          advance_amount?: number;
          notes?: string | null;
          special_requirements?: string | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string | null;
          category:
            | "fuel"
            | "toll"
            | "driver_allowance"
            | "parking"
            | "maintenance"
            | "food"
            | "other";
          amount: number;
          description: string | null;
          bill_url: string | null;
          expense_date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          category:
            | "fuel"
            | "toll"
            | "driver_allowance"
            | "parking"
            | "maintenance"
            | "food"
            | "other";
          amount: number;
          description?: string | null;
          bill_url?: string | null;
          expense_date?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          category?:
            | "fuel"
            | "toll"
            | "driver_allowance"
            | "parking"
            | "maintenance"
            | "food"
            | "other";
          amount?: number;
          description?: string | null;
          bill_url?: string | null;
          expense_date?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          trip_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          trip_id?: string | null;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          trip_id?: string | null;
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          trip_id: string;
          amount: number;
          payment_mode: "cash" | "upi" | "card" | "bank_transfer" | "other";
          payment_status: "paid" | "partial" | "pending";
          payment_date: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          amount: number;
          payment_mode: "cash" | "upi" | "card" | "bank_transfer" | "other";
          payment_status?: "paid" | "partial" | "pending";
          payment_date?: string;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          amount?: number;
          payment_mode?: "cash" | "upi" | "card" | "bank_transfer" | "other";
          payment_status?: "paid" | "partial" | "pending";
          payment_date?: string;
          notes?: string | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};
