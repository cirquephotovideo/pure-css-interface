
/**
 * Railway DB Edge Function
 * Provides access to Railway PostgreSQL database via secure edge function
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { handleCorsRequest } from "./response-utils.ts";
import { handleRequest } from "./query-handler.ts";

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  // Log headers for debugging
  console.log("Request headers:", Array.from(req.headers.entries())
    .filter(([key]) => !key.includes('authorization') && !key.includes('password'))
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));

  return handleRequest(req);
});
