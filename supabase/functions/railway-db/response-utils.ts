
/**
 * Response utilities for the Railway DB edge function
 */
import { corsHeaders } from "./config.ts";

/**
 * Creates an error response with the given status code and message
 */
export function createErrorResponse(message, status = 500) {
  console.error(`Creating error response (${status}):`, message);
  
  // Add timestamp and more context to error responses
  const errorResponse = {
    data: null, 
    count: 0, 
    error: message,
    timestamp: new Date().toISOString(),
    details: {
      status,
      message,
      serverInfo: {
        // Include basic server info that might help debugging
        deno: Deno.version.deno,
        v8: Deno.version.v8,
        typescript: Deno.version.typescript,
      }
    }
  };
  
  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Creates a success response with the query results
 */
export function createSuccessResponse(data, count) {
  console.log(`Creating success response with ${count} rows`);
  
  return new Response(
    JSON.stringify({ 
      data, 
      count, 
      error: null,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders });
}
