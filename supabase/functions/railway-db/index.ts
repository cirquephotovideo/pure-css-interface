
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-railway-token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body for the query and configuration
    const requestData = await req.json();
    const { query, params, readOnly, dbConfig } = requestData;

    // Get Railway DB connection details from request or environment variables
    const RAILWAY_DB_HOST = dbConfig?.host || Deno.env.get('RAILWAY_DB_HOST');
    const RAILWAY_DB_PORT = dbConfig?.port || Deno.env.get('RAILWAY_DB_PORT');
    const RAILWAY_DB_NAME = dbConfig?.database || Deno.env.get('RAILWAY_DB_NAME');
    const RAILWAY_DB_USER = dbConfig?.user || Deno.env.get('RAILWAY_DB_USER');
    const RAILWAY_DB_PASSWORD = dbConfig?.password || Deno.env.get('RAILWAY_DB_PASSWORD');

    if (!RAILWAY_DB_HOST || !RAILWAY_DB_PORT || !RAILWAY_DB_NAME || !RAILWAY_DB_USER || !RAILWAY_DB_PASSWORD) {
      console.error("Missing Railway database configuration variables");
      return new Response(
        JSON.stringify({ 
          data: null, 
          count: 0, 
          error: "Missing Railway database configuration. Please check environment variables." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Railway token from request headers
    const railwayToken = req.headers.get('x-railway-token');
    if (!railwayToken) {
      console.error("No Railway token provided");
      return new Response(
        JSON.stringify({ 
          data: null, 
          count: 0, 
          error: "No Railway token provided. Please provide a valid token." 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!query) {
      console.error("No SQL query provided in request");
      return new Response(
        JSON.stringify({ data: null, count: 0, error: "No SQL query provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if the query is read-only
    if (readOnly) {
      const upperQuery = query.trim().toUpperCase();
      if (!upperQuery.startsWith('SELECT')) {
        console.error("Write operation detected with read-only token");
        return new Response(
          JSON.stringify({ 
            data: null, 
            count: 0, 
            error: "The token provided is read-only, but a write operation was detected." 
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    console.log(`Executing query: ${query.substring(0, 100)}... with params: ${JSON.stringify(params || [])}`);
    console.log(`Connecting to Railway DB at ${RAILWAY_DB_HOST}:${RAILWAY_DB_PORT}/${RAILWAY_DB_NAME}`);

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
      // Add connection timeout
      connection: {
        attempts: 3,
        delay: 1000
      }
    });

    console.log("Connecting to Railway DB...");
    
    // Connect to Railway DB
    try {
      await client.connect();
      console.log("Successfully connected to Railway DB");
    } catch (connectError) {
      console.error("Error connecting to Railway DB:", connectError.message);
      return new Response(
        JSON.stringify({ 
          data: null, 
          count: 0, 
          error: `Connection failed: ${connectError.message}. Please check Railway database configuration.` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    try {
      // Execute the query
      console.log("Executing query on Railway DB:", query);
      console.log("With parameters:", params || []);
      const result = await client.queryObject(query, params || []);
      console.log(`Query executed successfully, returned ${result.rows.length} rows`);
      
      // Log a sample row to help with debugging (only if there are rows)
      if (result.rows.length > 0) {
        console.log("Sample row:", JSON.stringify(result.rows[0], null, 2));
      }

      // Return the result
      return new Response(
        JSON.stringify({ data: result.rows, count: result.rows.length, error: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (queryError) {
      console.error("Error executing query:", queryError.message);
      return new Response(
        JSON.stringify({ 
          data: null, 
          count: 0, 
          error: `Query execution failed: ${queryError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } finally {
      // Always close the connection
      console.log("Closing Railway DB connection...");
      await client.end();
      console.log("Railway DB connection closed");
    }
  } catch (error) {
    console.error("Error in Railway DB function:", error.message, error.stack);
    
    return new Response(
      JSON.stringify({ 
        data: null, 
        count: 0, 
        error: `Server error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
