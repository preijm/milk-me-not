import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit configurations per action
const RATE_LIMITS: Record<string, { maxAttempts: number; windowMinutes: number }> = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  signup: { maxAttempts: 3, windowMinutes: 60 },
  password_reset: { maxAttempts: 3, windowMinutes: 60 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, identifier } = await req.json();

    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: "Missing action or identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = RATE_LIMITS[action];
    if (!config) {
      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize identifier (email) - basic validation
    const sanitizedIdentifier = identifier.trim().toLowerCase().slice(0, 254);

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Periodically cleanup old entries (1% chance per request to avoid overhead)
    if (Math.random() < 0.01) {
      await supabaseAdmin.rpc("cleanup_rate_limit_attempts").catch(() => {});
    }

    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      p_identifier: sanitizedIdentifier,
      p_action: action,
      p_max_attempts: config.maxAttempts,
      p_window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      // Fail open - don't block users if rate limiting fails
      return new Response(
        JSON.stringify({ allowed: true, attempts_remaining: 0, retry_after_seconds: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data?.[0] ?? { allowed: true, attempts_remaining: 0, retry_after_seconds: 0 };

    return new Response(JSON.stringify(result), {
      status: result.allowed ? 200 : 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Rate limit function error:", err);
    // Fail open
    return new Response(
      JSON.stringify({ allowed: true, attempts_remaining: 0, retry_after_seconds: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
