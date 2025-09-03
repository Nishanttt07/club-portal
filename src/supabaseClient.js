import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://avhwdwcxghhenalyimww.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHdkd2N4Z2hoZW5hbHlpbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODM5ODEsImV4cCI6MjA3MjQ1OTk4MX0.BQGB6JBMT7eEHeKBpcdNfv-kBikU73cXOAsoCqfsyRo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
