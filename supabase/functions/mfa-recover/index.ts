import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Trades a recovery code for removing the reader's authenticator.
 *
 * Called from the code prompt by someone who has signed in with their password
 * but no longer has the phone. Removing a factor needs the admin API, which is
 * why this is a function and not a database call from the browser.
 *
 * ponytail: no attempt limit. A code is 48 random bits and the caller already
 * needed the password, so guessing is not a practical attack. Add one through
 * check_rate_limit if that ever changes.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    const { code } = await req.json();
    if (!token || typeof code !== "string" || !code.trim()) {
      return json({ error: "Missing code" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Who is asking comes from their own session, never from the request body.
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) {
      return json({ error: "Not signed in" }, 401);
    }

    const { data: valid, error: consumeError } = await admin.rpc("consume_mfa_recovery_code", {
      p_user_id: user.id,
      p_code: code,
    });
    if (consumeError) throw consumeError;
    if (!valid) {
      return json({ error: "That recovery code is not valid, or has been used" }, 400);
    }

    const { data: factors, error: listError } = await admin.auth.admin.mfa.listFactors({ userId: user.id });
    if (listError) throw listError;
    for (const factor of factors.factors) {
      const { error } = await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId: user.id });
      if (error) throw error;
    }

    return json({ ok: true });
  } catch (err) {
    console.error("mfa-recover error:", err);
    return json({ error: "Something went wrong" }, 500);
  }
});
