import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const submitListingInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().min(2).max(100),
        phone: z.string().min(7).max(20),
        email: z.string().email().optional().or(z.literal("")),
        location: z.string().min(2).max(100),
        property_type: z.string().max(50).optional(),
        message: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
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
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().min(2).max(100),
        phone: z.string().max(20).optional(),
        email: z.string().email().optional().or(z.literal("")),
        subject: z.string().max(200).optional(),
        message: z.string().min(2).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
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
