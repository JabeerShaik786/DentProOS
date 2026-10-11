import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const envOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...envOrigins,
];

serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin") ?? "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  // 1. Handle CORS Preflight Requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  // 2. Restrict HTTP Method to POST Only
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || "";

    // 3. Authenticate Caller via Supabase Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userErr } = await userSupabase.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Verify User Role is "owner" in profiles Table
    const { data: profile, error: profileErr } = await userSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== "owner") {
      return new Response(
        JSON.stringify({ success: false, error: "Only the Owner can start a database backup." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Record Persistent Backup Entry in backup_history Table First
    const { data: historyRow, error: historyErr } = await userSupabase
      .from("backup_history")
      .insert({ status: "triggered" })
      .select("id")
      .single();

    if (historyErr || !historyRow?.id) {
      console.error("Diagnostic: Unable to record backup_history entry:", historyErr?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to initialize backup history entry." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const backupId = historyRow.id;

    // 6. Read GitHub Backup Secret Token (Server-Side Only)
    const githubToken = Deno.env.get("GITHUB_BACKUP_TRIGGER_TOKEN");
    if (!githubToken) {
      // Update record status to failed if configuration error occurs
      await userSupabase.from("backup_history").update({ status: "failed" }).eq("id", backupId);
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error: GITHUB_BACKUP_TRIGGER_TOKEN missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Configurable GitHub Action Workflow Parameters (per clinic repository)
    const githubOwner = Deno.env.get("GITHUB_OWNER") || "JabeerShaik786";
    const githubRepo = Deno.env.get("GITHUB_REPO") || "DentProOS";
    const workflowFilename = Deno.env.get("GITHUB_BACKUP_WORKFLOW") || "dentpro-backup.yml";
    const githubRef = Deno.env.get("GITHUB_REF") || "main";

    const githubApiUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${workflowFilename}/dispatches`;

    // 8. Dispatch GitHub Actions Backup Workflow with backup_id
    const ghResponse = await fetch(githubApiUrl, {
      method: "POST",
      headers: {
        "User-Agent": "DentPro-Backup-Function",
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: githubRef,
        inputs: {
          backup_id: backupId,
        },
      }),
    });

    const ghResponseText = await ghResponse.text();

    if (ghResponse.status !== 204) {
      console.error("GitHub workflow dispatch response:", {
        status: ghResponse.status,
        body: ghResponseText,
      });

      // Update record status to failed if workflow dispatch fails
      await userSupabase.from("backup_history").update({ status: "failed" }).eq("id", backupId);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to trigger GitHub backup workflow." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Return HTTP 202 Acknowledging Workflow Dispatch Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Backup started successfully.",
        workflow: workflowFilename,
        backup_id: backupId,
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
