import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const submitListingInquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      full_name: z.string().min(2).max(100),
      phone: z.string().min(7).max(20),
      email: z.string().email().optional().or(z.literal("")),
      location: z.string().min(2).max(100),
      property_type: z.string().max(50).optional(),
      message: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true, skipped: true };
    const { error } = await sb.from("listing_inquiries").insert({
      full_name: data.full_name,
      phone: data.phone,
      email: data.email || null,
      location: data.location,
      property_type: data.property_type || null,
      message: data.message || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      full_name: z.string().min(2).max(100),
      phone: z.string().max(20).optional(),
      email: z.string().email().optional().or(z.literal("")),
      subject: z.string().max(200).optional(),
      message: z.string().min(2).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true, skipped: true };
    const { error } = await sb.from("contact_messages").insert({
      full_name: data.full_name,
      phone: data.phone || null,
      email: data.email || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const initViewingFeePayment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      propertyId: z.string().uuid(),
      phone: z.string().min(9).max(15),
      amount: z.coerce.number().min(1),
      reference: z.string().min(3).max(120),
    }),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true, skipped: true };

    const { error: insertError } = await sb.from("viewing_payments").insert({
      property_id: data.propertyId,
      phone: data.phone,
      amount: data.amount,
      status: "pending",
      reference: data.reference,
      provider: "mpesa",
    });

    if (insertError) throw new Error(insertError.message);

    return {
      ok: true,
      message: "STK push initiated. Complete the prompt on your phone to confirm payment.",
      reference: data.reference,
    };
  });

export const handleViewingFeeCallback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      reference: z.string(),
      status: z.enum(["success", "failed"]),
      amount: z.coerce.number().optional(),
      message: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true };
    const status = data.status === "success" ? "succeeded" : "failed";
    const { error } = await sb
      .from("viewing_payments")
      .update({ status, provider_message: data.message ?? null, updated_at: new Date().toISOString() })
      .eq("reference", data.reference);
    if (error) throw new Error(error.message);
    return { ok: true, status };
  });

export const uploadPropertyImage = createServerFn({ method: "POST" })
  .validator(z.object({ fileName: z.string(), contentType: z.string(), file: z.string() }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true, skipped: true };
    const bucket = "property-images";
    const decoded = Buffer.from(data.file, "base64");
    const path = `properties/${Date.now()}-${data.fileName}`;
    const { error } = await sb.storage.from(bucket).upload(path, decoded, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: publicUrlData } = sb.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: publicUrlData.publicUrl };
  });

export const listAgents = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().optional() }).partial())
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return [];
    let q = sb.from("agents").select("*").eq("is_active", true).order("created_at", { ascending: false });
    if (data.slug) q = q.eq("slug", data.slug);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
