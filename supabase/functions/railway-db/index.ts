
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Railway DB connection details from environment variables
    const RAILWAY_DB_HOST = Deno.env.get('RAILWAY_DB_HOST');
    const RAILWAY_DB_PORT = Deno.env.get('RAILWAY_DB_PORT');
    const RAILWAY_DB_NAME = Deno.env.get('RAILWAY_DB_NAME');
    const RAILWAY_DB_USER = Deno.env.get('RAILWAY_DB_USER');
    const RAILWAY_DB_PASSWORD = Deno.env.get('RAILWAY_DB_PASSWORD');

    if (!RAILWAY_DB_HOST || !RAILWAY_DB_PORT || !RAILWAY_DB_NAME || !RAILWAY_DB_USER || !RAILWAY_DB_PASSWORD) {
      throw new Error("Missing Railway database configuration");
    }

    // Parse the request body for the query
    const { query, params } = await req.json();

    if (!query) {
      throw new Error("No SQL query provided");
    }

    // Create a Postgres client connected to Railway
    const client = new Client({
      hostname: RAILWAY_DB_HOST,
      port: Number(RAILWAY_DB_PORT),
      database: RAILWAY_DB_NAME,
      user: RAILWAY_DB_USER,
      password: RAILWAY_DB_PASSWORD,
      tls: {
        enabled: true,
      },
    });

    // Connect to Railway DB
    await client.connect();
    console.log("Connected to Railway PostgreSQL database");

    try {
      // Execute the query
      const result = await client.queryObject(query, params || []);
      console.log(`Query executed successfully with ${result.rows.length} rows returned`);

      // Return the result
      return new Response(
        JSON.stringify({ data: result.rows, count: result.rows.length, error: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      // Always close the connection
      await client.end();
      console.log("Connection to Railway PostgreSQL database closed");
    }
  } catch (error) {
    console.error("Error executing query:", error.message);
    
    return new Response(
      JSON.stringify({ data: null, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
