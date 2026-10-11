import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Server configuration error: Service role key missing." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // GET: Expose minimal active doctor info for public form dropdown
  if (req.method === "GET") {
    try {
      const { data: doctors, error } = await supabase
        .from("doctors")
        .select("id, name, specialty, status")
        .order("name", { ascending: true });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to load doctors." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const safeDoctors = (doctors || [])
        .filter(d => !d.status || d.status === "Available" || d.status === "Active")
        .map(d => ({
          id: d.id,
          name: d.name,
          speciality: d.specialty || d.speciality || "General Dentist"
        }));

      return new Response(
        JSON.stringify({ success: true, doctors: safeDoctors }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: "Server error loading options." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // POST: Public appointment request submission
  if (req.method === "POST") {
    try {
      let body: any;
      try {
        body = await req.json();
      } catch (e) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON request payload." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const {
        name,
        phone,
        email,
        date,
        preferredDate,
        time,
        preferredTime,
        doctor,
        doctorId,
        treatment,
        procedure,
        notes
      } = body || {};

      // 1. Server-side Validation
      const rawName = (name || "").trim();
      if (!rawName || rawName.length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: "Full name is required (minimum 2 characters)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const sanitizedName = rawName.slice(0, 100);

      const rawPhone = (phone || "").trim();
      const digits = rawPhone.replace(/\D/g, "");
      if (!digits || digits.length < 10) {
        return new Response(
          JSON.stringify({ success: false, error: "A valid 10-digit phone number is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const phone10 = digits.slice(-10);
      const normalizedPhone = `+91 ${phone10.slice(0, 5)} ${phone10.slice(5)}`;

      const targetDateStr = (date || preferredDate || "").trim();
      if (!targetDateStr) {
        return new Response(
          JSON.stringify({ success: false, error: "Preferred appointment date is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let formattedDate = targetDateStr;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
        const parsed = new Date(targetDateStr);
        if (isNaN(parsed.getTime())) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid date format. Use YYYY-MM-DD." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        formattedDate = parsed.toISOString().split("T")[0];
      }

      const targetTimeStr = (time || preferredTime || "09:00 AM").trim();
      const sanitizedTime = targetTimeStr.slice(0, 20);

      const sanitizedProcedure = (procedure || treatment || "Consultation").trim().slice(0, 100);
      const sanitizedNotes = (notes || "").trim().slice(0, 300);
      const sanitizedEmail = email ? String(email).trim().toLowerCase().slice(0, 100) : null;

      // 2. Doctor Lookup
      let validDoctorId: string | null = null;
      const requestedDoctorId = doctorId || doctor;
      if (requestedDoctorId && typeof requestedDoctorId === "string" && requestedDoctorId.trim()) {
        const { data: docRecord } = await supabase
          .from("doctors")
          .select("id")
          .eq("id", requestedDoctorId.trim())
          .maybeSingle();

        if (docRecord) {
          validDoctorId = docRecord.id;
        }
      }

      // 3. Patient Matching
      const { data: dbPatients, error: patFetchErr } = await supabase
        .from("patients")
        .select("id, patient_id, name, phone");

      if (patFetchErr) {
        return new Response(
          JSON.stringify({ success: false, error: "Database service error." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let matchedPatient = (dbPatients || []).find((p: any) => {
        const pDigits = (p.phone || "").replace(/\D/g, "");
        return pDigits.endsWith(phone10);
      });

      let patientUuid: string;

      function convertToUiDate(dbDateStr: string): string {
        if (!dbDateStr) return "12 Aug 2026";
        const parts = dbDateStr.split("-");
        if (parts.length === 3) {
          const year = parts[0];
          const monthNum = parts[1];
          const day = parts[2].padStart(2, "0");
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthIndex = parseInt(monthNum, 10) - 1;
          const month = months[monthIndex] || "Jan";
          return `${day} ${month} ${year}`;
        }
        return dbDateStr;
      }

      if (matchedPatient) {
        patientUuid = matchedPatient.id;
      } else {
        // Sequential 4-digit ID calculation (0001, 0002, ...)
        let maxNum = 0;
        (dbPatients || []).forEach((p: any) => {
          const rawId = p.patient_id || p.id || "";
          const matches = rawId.match(/\d+/g);
          if (matches) {
            matches.forEach((m: string) => {
              const num = parseInt(m, 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            });
          }
        });
        const newSeqId = (maxNum + 1).toString().padStart(4, "0");

        const { data: newPat, error: newPatErr } = await supabase
          .from("patients")
          .insert({
            patient_id: newSeqId,
            name: sanitizedName,
            phone: normalizedPhone,
            email: sanitizedEmail,
            patient_type: "New",
            status: "Active",
            visit: convertToUiDate(formattedDate),
            balance: "₹0",
            medical_notes: "None"
          })
          .select()
          .single();

        if (newPatErr || !newPat) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to register patient record." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        patientUuid = newPat.id;
      }

      // 4. Duplicate Check
      const { data: existingAppts } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", patientUuid)
        .eq("appointment_date", formattedDate)
        .eq("time_slot", sanitizedTime)
        .neq("status", "Cancelled");

      if (existingAppts && existingAppts.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Your appointment request has been received. Our clinic will contact you to confirm your appointment."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 5. Create Appointment
      const requestNotes = sanitizedNotes ? `Public Request: ${sanitizedNotes}` : "Public Request";

      const { error: apptInsErr } = await supabase
        .from("appointments")
        .insert({
          patient_id: patientUuid,
          doctor_id: validDoctorId,
          appointment_date: formattedDate,
          time_slot: sanitizedTime,
          procedure_name: sanitizedProcedure,
          status: "Scheduled",
          notes: requestNotes
        });

      if (apptInsErr) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to submit appointment request." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Your appointment request has been received. Our clinic will contact you to confirm your appointment."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: "An unexpected server error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});
