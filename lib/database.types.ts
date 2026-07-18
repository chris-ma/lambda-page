export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ab_assignments: {
        Row: { created_at: string; id: string; session_id: string; test_id: string; variant_id: string };
        Insert: { created_at?: string; id?: string; session_id: string; test_id: string; variant_id: string };
        Update: { created_at?: string; id?: string; session_id?: string; test_id?: string; variant_id?: string };
        Relationships: [
          { foreignKeyName: "ab_assignments_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "ab_tests"; referencedColumns: ["id"] },
          { foreignKeyName: "ab_assignments_variant_id_fkey"; columns: ["variant_id"]; isOneToOne: false; referencedRelation: "ab_variants"; referencedColumns: ["id"] },
        ];
      };
      ab_conversions: {
        Row: { assignment_id: string; created_at: string; id: string };
        Insert: { assignment_id: string; created_at?: string; id?: string };
        Update: { assignment_id?: string; created_at?: string; id?: string };
        Relationships: [
          { foreignKeyName: "ab_conversions_assignment_id_fkey"; columns: ["assignment_id"]; isOneToOne: false; referencedRelation: "ab_assignments"; referencedColumns: ["id"] },
        ];
      };
      ab_tests: {
        Row: { created_at: string; hypothesis: string | null; id: string; name: string; page_id: string };
        Insert: { created_at?: string; hypothesis?: string | null; id?: string; name: string; page_id: string };
        Update: { created_at?: string; hypothesis?: string | null; id?: string; name?: string; page_id?: string };
        Relationships: [
          { foreignKeyName: "ab_tests_page_id_fkey"; columns: ["page_id"]; isOneToOne: false; referencedRelation: "pages"; referencedColumns: ["id"] },
        ];
      };
      ab_variants: {
        Row: { id: string; label: string; test_id: string };
        Insert: { id?: string; label: string; test_id: string };
        Update: { id?: string; label?: string; test_id?: string };
        Relationships: [
          { foreignKeyName: "ab_variants_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "ab_tests"; referencedColumns: ["id"] },
        ];
      };
      analysis_runs: {
        Row: {
          completed_at: string | null; created_at: string; error: string | null; id: string; kind: string;
          page_id: string | null; pillar: number; status: string; summary: Json | null; target_url: string;
          stimulus: Buffer | null; stim_width: number | null; stim_height: number | null; stim_mime: string; context: string | null;
          name: string | null; set_id: string | null;
        };
        Insert: {
          completed_at?: string | null; created_at?: string; error?: string | null; id?: string; kind: string;
          page_id?: string | null; pillar: number; status?: string; summary?: Json | null; target_url: string;
          stimulus?: Buffer | null; stim_width?: number | null; stim_height?: number | null; stim_mime?: string; context?: string | null;
          name?: string | null; set_id?: string | null;
        };
        Update: {
          completed_at?: string | null; created_at?: string; error?: string | null; id?: string; kind?: string;
          page_id?: string | null; pillar?: number; status?: string; summary?: Json | null; target_url?: string;
          stimulus?: Buffer | null; stim_width?: number | null; stim_height?: number | null; stim_mime?: string; context?: string | null;
          name?: string | null; set_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "analysis_runs_page_id_fkey"; columns: ["page_id"]; isOneToOne: false; referencedRelation: "pages"; referencedColumns: ["id"] },
          { foreignKeyName: "analysis_runs_set_id_fkey"; columns: ["set_id"]; isOneToOne: false; referencedRelation: "competitive_sets"; referencedColumns: ["id"] },
        ];
      };
      competitive_sets: {
        Row: { created_at: string; error: string | null; id: string; name: string; project_id: string; status: string; synthesis: string | null };
        Insert: { created_at?: string; error?: string | null; id?: string; name: string; project_id: string; status?: string; synthesis?: string | null };
        Update: { created_at?: string; error?: string | null; id?: string; name?: string; project_id?: string; status?: string; synthesis?: string | null };
        Relationships: [
          { foreignKeyName: "competitive_sets_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      five_second_tests: {
        Row: { id: string; project_id: string; name: string; brief: string | null; image: Buffer; image_mime: string; image_width: number; image_height: number; created_at: string };
        Insert: { id?: string; project_id: string; name: string; brief?: string | null; image: Buffer; image_mime?: string; image_width: number; image_height: number; created_at?: string };
        Update: { id?: string; project_id?: string; name?: string; brief?: string | null; image?: Buffer; image_mime?: string; image_width?: number; image_height?: number; created_at?: string };
        Relationships: [
          { foreignKeyName: "five_second_tests_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      five_second_questions: {
        Row: { id: string; test_id: string; prompt: string; position: number };
        Insert: { id?: string; test_id: string; prompt: string; position?: number };
        Update: { id?: string; test_id?: string; prompt?: string; position?: number };
        Relationships: [
          { foreignKeyName: "five_second_questions_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "five_second_tests"; referencedColumns: ["id"] },
        ];
      };
      five_second_sessions: {
        Row: { id: string; test_id: string; answers: Json; created_at: string };
        Insert: { id?: string; test_id: string; answers?: Json; created_at?: string };
        Update: { id?: string; test_id?: string; answers?: Json; created_at?: string };
        Relationships: [
          { foreignKeyName: "five_second_sessions_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "five_second_tests"; referencedColumns: ["id"] },
        ];
      };
      usability_tests: {
        Row: { id: string; project_id: string; name: string; target_url: string; task: string; goal_url_pattern: string | null; created_at: string };
        Insert: { id?: string; project_id: string; name: string; target_url: string; task: string; goal_url_pattern?: string | null; created_at?: string };
        Update: { id?: string; project_id?: string; name?: string; target_url?: string; task?: string; goal_url_pattern?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "usability_tests_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      usability_participants: {
        Row: { id: string; test_id: string; code: string; label: string | null; started_at: string | null; last_seen_at: string | null; completed_at: string | null; created_at: string };
        Insert: { id?: string; test_id: string; code: string; label?: string | null; started_at?: string | null; last_seen_at?: string | null; completed_at?: string | null; created_at?: string };
        Update: { id?: string; test_id?: string; code?: string; label?: string | null; started_at?: string | null; last_seen_at?: string | null; completed_at?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "usability_participants_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "usability_tests"; referencedColumns: ["id"] },
        ];
      };
      usability_events: {
        Row: { id: number; participant_id: string; type: string; url: string | null; selector: string | null; label: string | null; x: number | null; y: number | null; created_at: string };
        Insert: { id?: number; participant_id: string; type: string; url?: string | null; selector?: string | null; label?: string | null; x?: number | null; y?: number | null; created_at?: string };
        Update: { id?: number; participant_id?: string; type?: string; url?: string | null; selector?: string | null; label?: string | null; x?: number | null; y?: number | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "usability_events_participant_id_fkey"; columns: ["participant_id"]; isOneToOne: false; referencedRelation: "usability_participants"; referencedColumns: ["id"] },
        ];
      };
      sort_studies: {
        Row: { id: string; project_id: string; type: string; name: string; instructions: string | null; sort_mode: string | null; created_at: string };
        Insert: { id?: string; project_id: string; type: string; name: string; instructions?: string | null; sort_mode?: string | null; created_at?: string };
        Update: { id?: string; project_id?: string; type?: string; name?: string; instructions?: string | null; sort_mode?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "sort_studies_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      sort_cards: {
        Row: { id: string; study_id: string; label: string; position: number };
        Insert: { id?: string; study_id: string; label: string; position?: number };
        Update: { id?: string; study_id?: string; label?: string; position?: number };
        Relationships: [
          { foreignKeyName: "sort_cards_study_id_fkey"; columns: ["study_id"]; isOneToOne: false; referencedRelation: "sort_studies"; referencedColumns: ["id"] },
        ];
      };
      sort_categories: {
        Row: { id: string; study_id: string; label: string; position: number };
        Insert: { id?: string; study_id: string; label: string; position?: number };
        Update: { id?: string; study_id?: string; label?: string; position?: number };
        Relationships: [
          { foreignKeyName: "sort_categories_study_id_fkey"; columns: ["study_id"]; isOneToOne: false; referencedRelation: "sort_studies"; referencedColumns: ["id"] },
        ];
      };
      tree_nodes: {
        Row: { id: string; study_id: string; parent_id: string | null; label: string; position: number };
        Insert: { id?: string; study_id: string; parent_id?: string | null; label: string; position?: number };
        Update: { id?: string; study_id?: string; parent_id?: string | null; label?: string; position?: number };
        Relationships: [
          { foreignKeyName: "tree_nodes_study_id_fkey"; columns: ["study_id"]; isOneToOne: false; referencedRelation: "sort_studies"; referencedColumns: ["id"] },
          { foreignKeyName: "tree_nodes_parent_id_fkey"; columns: ["parent_id"]; isOneToOne: false; referencedRelation: "tree_nodes"; referencedColumns: ["id"] },
        ];
      };
      tree_tasks: {
        Row: { id: string; study_id: string; prompt: string; correct_node_id: string | null; position: number };
        Insert: { id?: string; study_id: string; prompt: string; correct_node_id?: string | null; position?: number };
        Update: { id?: string; study_id?: string; prompt?: string; correct_node_id?: string | null; position?: number };
        Relationships: [
          { foreignKeyName: "tree_tasks_study_id_fkey"; columns: ["study_id"]; isOneToOne: false; referencedRelation: "sort_studies"; referencedColumns: ["id"] },
        ];
      };
      sort_sessions: {
        Row: { id: string; study_id: string; duration_ms: number | null; created_at: string };
        Insert: { id?: string; study_id: string; duration_ms?: number | null; created_at?: string };
        Update: { id?: string; study_id?: string; duration_ms?: number | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "sort_sessions_study_id_fkey"; columns: ["study_id"]; isOneToOne: false; referencedRelation: "sort_studies"; referencedColumns: ["id"] },
        ];
      };
      sort_groups: {
        Row: { id: string; session_id: string; label: string; reason: string | null; position: number };
        Insert: { id?: string; session_id: string; label: string; reason?: string | null; position?: number };
        Update: { id?: string; session_id?: string; label?: string; reason?: string | null; position?: number };
        Relationships: [
          { foreignKeyName: "sort_groups_session_id_fkey"; columns: ["session_id"]; isOneToOne: false; referencedRelation: "sort_sessions"; referencedColumns: ["id"] },
        ];
      };
      sort_placements: {
        Row: { id: string; session_id: string; card_id: string; group_id: string };
        Insert: { id?: string; session_id: string; card_id: string; group_id: string };
        Update: { id?: string; session_id?: string; card_id?: string; group_id?: string };
        Relationships: [
          { foreignKeyName: "sort_placements_session_id_fkey"; columns: ["session_id"]; isOneToOne: false; referencedRelation: "sort_sessions"; referencedColumns: ["id"] },
          { foreignKeyName: "sort_placements_card_id_fkey"; columns: ["card_id"]; isOneToOne: false; referencedRelation: "sort_cards"; referencedColumns: ["id"] },
          { foreignKeyName: "sort_placements_group_id_fkey"; columns: ["group_id"]; isOneToOne: false; referencedRelation: "sort_groups"; referencedColumns: ["id"] },
        ];
      };
      tree_task_results: {
        Row: { id: string; session_id: string; task_id: string; first_click_node_id: string | null; final_node_id: string | null; success: boolean | null; duration_ms: number | null };
        Insert: { id?: string; session_id: string; task_id: string; first_click_node_id?: string | null; final_node_id?: string | null; success?: boolean | null; duration_ms?: number | null };
        Update: { id?: string; session_id?: string; task_id?: string; first_click_node_id?: string | null; final_node_id?: string | null; success?: boolean | null; duration_ms?: number | null };
        Relationships: [
          { foreignKeyName: "tree_task_results_session_id_fkey"; columns: ["session_id"]; isOneToOne: false; referencedRelation: "sort_sessions"; referencedColumns: ["id"] },
          { foreignKeyName: "tree_task_results_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tree_tasks"; referencedColumns: ["id"] },
        ];
      };
      tree_task_path_nodes: {
        Row: { id: number; result_id: string; node_id: string; position: number };
        Insert: { id?: number; result_id: string; node_id: string; position: number };
        Update: { id?: number; result_id?: string; node_id?: string; position?: number };
        Relationships: [
          { foreignKeyName: "tree_task_path_nodes_result_id_fkey"; columns: ["result_id"]; isOneToOne: false; referencedRelation: "tree_task_results"; referencedColumns: ["id"] },
          { foreignKeyName: "tree_task_path_nodes_node_id_fkey"; columns: ["node_id"]; isOneToOne: false; referencedRelation: "tree_nodes"; referencedColumns: ["id"] },
        ];
      };
      events: {
        Row: {
          created_at: string; device: string | null; id: string; page_id: string; path: string | null;
          payload: Json; session_id: string; source: string | null; type: string; viewport_h: number | null; viewport_w: number | null;
        };
        Insert: {
          created_at?: string; device?: string | null; id?: string; page_id: string; path?: string | null;
          payload?: Json; session_id: string; source?: string | null; type: string; viewport_h?: number | null; viewport_w?: number | null;
        };
        Update: {
          created_at?: string; device?: string | null; id?: string; page_id?: string; path?: string | null;
          payload?: Json; session_id?: string; source?: string | null; type?: string; viewport_h?: number | null; viewport_w?: number | null;
        };
        Relationships: [
          { foreignKeyName: "events_page_id_fkey"; columns: ["page_id"]; isOneToOne: false; referencedRelation: "pages"; referencedColumns: ["id"] },
        ];
      };
      findings: {
        Row: { attribute: string; component: string; created_at: string; detail: string | null; fix: string | null; id: string; run_id: string; status: string; value: string | null; x: number | null; y: number | null; judgment: boolean };
        Insert: { attribute: string; component: string; created_at?: string; detail?: string | null; fix?: string | null; id?: string; run_id: string; status: string; value?: string | null; x?: number | null; y?: number | null; judgment?: boolean };
        Update: { attribute?: string; component?: string; created_at?: string; detail?: string | null; fix?: string | null; id?: string; run_id?: string; status?: string; value?: string | null; x?: number | null; y?: number | null; judgment?: boolean };
        Relationships: [
          { foreignKeyName: "findings_run_id_fkey"; columns: ["run_id"]; isOneToOne: false; referencedRelation: "analysis_runs"; referencedColumns: ["id"] },
        ];
      };
      message_responses: {
        Row: { comprehension: boolean | null; confidence: number | null; created_at: string; id: string; recall: string | null; variant_id: string };
        Insert: { comprehension?: boolean | null; confidence?: number | null; created_at?: string; id?: string; recall?: string | null; variant_id: string };
        Update: { comprehension?: boolean | null; confidence?: number | null; created_at?: string; id?: string; recall?: string | null; variant_id?: string };
        Relationships: [
          { foreignKeyName: "message_responses_variant_id_fkey"; columns: ["variant_id"]; isOneToOne: false; referencedRelation: "message_variants"; referencedColumns: ["id"] },
        ];
      };
      message_tests: {
        Row: { created_at: string; id: string; name: string; project_id: string; prompt: string | null };
        Insert: { created_at?: string; id?: string; name: string; project_id: string; prompt?: string | null };
        Update: { created_at?: string; id?: string; name?: string; project_id?: string; prompt?: string | null };
        Relationships: [
          { foreignKeyName: "message_tests_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      message_variants: {
        Row: { body: string | null; headline: string; id: string; label: string; test_id: string };
        Insert: { body?: string | null; headline: string; id?: string; label: string; test_id: string };
        Update: { body?: string | null; headline?: string; id?: string; label?: string; test_id?: string };
        Relationships: [
          { foreignKeyName: "message_variants_test_id_fkey"; columns: ["test_id"]; isOneToOne: false; referencedRelation: "message_tests"; referencedColumns: ["id"] },
        ];
      };
      pages: {
        Row: { created_at: string; id: string; project_id: string; tracking_id: string; url: string };
        Insert: { created_at?: string; id?: string; project_id: string; tracking_id?: string; url: string };
        Update: { created_at?: string; id?: string; project_id?: string; tracking_id?: string; url?: string };
        Relationships: [
          { foreignKeyName: "pages_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },
        ];
      };
      projects: {
        Row: { created_at: string; id: string; name: string; palette: Json | null };
        Insert: { created_at?: string; id?: string; name: string; palette?: Json | null };
        Update: { created_at?: string; id?: string; name?: string; palette?: Json | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
