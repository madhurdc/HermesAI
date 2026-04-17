import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Admin client — uses the service role key for full DB access (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
