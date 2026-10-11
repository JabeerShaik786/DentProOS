import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

serve(async (req: Request) => {
  // 1. Restrict HTTP Method to POST Only
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Validate Server-to-Server Callback Secret in Header Only
  const callbackSecretEnv = Deno.env.get("BACKUP_CALLBACK_SECRET");
  const providedSecret = req.headers.get("x-callback-secret");

  if (!callbackSecretEnv || !providedSecret || providedSecret !== callbackSecretEnv) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized callback request." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 3. Parse and Validate Request Body
    const body = await req.json();
    const { backup_id, status, backup_size, file_name } = body;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!backup_id || typeof backup_id !== "string" || !uuidRegex.test(backup_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid backup_id." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (status !== "completed" && status !== "failed") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid status value. Must be 'completed' or 'failed'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Initialize Privileged Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Diagnostic: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backup-callback.");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 5. Update Exact backup_history Row
    if (status === "completed") {
      const parsedSize = backup_size ? Number(backup_size) : null;
      const { error: updateErr } = await adminSupabase
        .from("backup_history")
        .update({
          status: "completed",
          backup_size: parsedSize,
          file_name: file_name ? String(file_name) : null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", backup_id);

      if (updateErr) {
        console.error("Diagnostic: Error updating backup_history record to completed:", updateErr.message);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update backup record." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // status === "failed"
      const { error: updateErr } = await adminSupabase
        .from("backup_history")
        .update({
          status: "failed",
        })
        .eq("id", backup_id);

      if (updateErr) {
        console.error("Diagnostic: Error updating backup_history record to failed:", updateErr.message);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update backup record." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Backup status updated to ${status}.` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
