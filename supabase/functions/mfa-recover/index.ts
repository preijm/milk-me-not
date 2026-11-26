import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Trades a recovery code for removing the reader's authenticator.
 *
 * Called from the code prompt by someone who has signed in with their password
 * but no longer has the phone. Removing a factor needs the admin API, which is
 * why this is a function and not a database call from the browser.
 *
 * Attempts are limited: five wrong codes per account per rolling hour, after
 * which every attempt gets a 429 until the hour has passed, right code or not.
 * The count, the code check and spending the set all happen in one database
 * call, redeem_mfa_recovery_code (20261126150000_limit_mfa_recovery_attempts.sql),
 * keyed by the user id from the verified session. It fails closed: a database
 * error is a 500, never a pass. (The check-rate-limit function is not used:
 * its SQL half never existed, and it counts every call, not failures.)
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

    const { data: outcome, error: redeemError } = await admin.rpc("redeem_mfa_recovery_code", {
      p_user_id: user.id,
      p_code: code,
    });
    if (redeemError) throw redeemError;
    if (outcome === "limited") {
      return json({ error: "Too many attempts. Try again in an hour." }, 429);
    }
    if (outcome !== "ok") {
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
