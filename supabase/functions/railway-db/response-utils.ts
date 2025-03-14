
/**
 * Response utilities for the Railway DB edge function
 */
import { corsHeaders } from "./config.ts";

/**
 * Creates an error response with the given status code and message
 */
export function createErrorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({ 
      data: null, 
      count: 0, 
      error: message 
    }),
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
  return new Response(
    JSON.stringify({ data, count, error: null }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders });
}
