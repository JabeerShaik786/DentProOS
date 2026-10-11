import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || "";

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: Service role key missing." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 1. Authenticate caller (Must be logged-in Owner)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Missing Authorization header." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });

  const { data: { user }, error: userErr } = await userSupabase.auth.getUser();
  if (userErr || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid or expired session token." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify role is Owner
  const { data: profile, error: profileErr } = await userSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile || profile.role !== "owner") {
    return new Response(
      JSON.stringify({ error: "Forbidden: Owner authorization required." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Admin client for Auth Admin operations
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // POST: Create Receptionist Staff Account
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { email, password, fullName, role, customTitle, phone, status } = body || {};

      if (!email || !fullName || !role) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: email, fullName, and role." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (role !== "receptionist") {
        return new Response(
          JSON.stringify({ error: "Invalid role: Owner can only create Receptionist accounts." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tempPassword = password || `Staff@${Math.random().toString(36).slice(-8)}`;

      // Create Auth user
      const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: String(fullName).trim(),
          role: "receptionist"
        }
      });

      if (authErr || !authData.user) {
        return new Response(
          JSON.stringify({ error: authErr?.message || "Failed to create authentication account." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = authData.user.id;

      // Upsert profile record
      const { data: profileRecord, error: upsertErr } = await adminSupabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: String(fullName).trim(),
          role: "receptionist",
          custom_title: customTitle ? String(customTitle).trim() : "Receptionist",
          phone: phone ? String(phone).trim() : "+91 98765 00000",
          status: status || "Active",
          has_login: true
        }, { onConflict: "id" })
        .select()
        .single();

      if (upsertErr) {
        await adminSupabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ error: upsertErr.message || "Failed to update staff profile record." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          profile: profileRecord,
          temporaryPassword: tempPassword,
          email: cleanEmail
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err?.message || "Internal server error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // DELETE: Remove Receptionist Staff Account
  if (req.method === "DELETE") {
    try {
      const url = new URL(req.url);
      const targetId = url.searchParams.get("id");

      if (!targetId) {
        return new Response(
          JSON.stringify({ error: "Staff member ID is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (targetId === user.id) {
        return new Response(
          JSON.stringify({ error: "Cannot delete the active clinic owner account." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete profile record
      const { error: deleteProfileErr } = await adminSupabase
        .from("profiles")
        .delete()
        .eq("id", targetId);

      if (deleteProfileErr) {
        return new Response(
          JSON.stringify({ error: deleteProfileErr.message || "Failed to delete staff profile." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete Auth user
      await adminSupabase.auth.admin.deleteUser(targetId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err?.message || "Internal server error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});
