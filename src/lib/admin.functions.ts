import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function adminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

const PropertyInput = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().max(5000).optional().nullable(),
  property_type: z.string().min(2).max(50),
  location: z.string().min(2).max(100),
  region: z.string().default("Gusii"),
  address: z.string().max(200).optional().nullable(),
  rent: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0).optional().nullable(),
  viewing_fee: z.coerce.number().min(0).default(300),
  bedrooms: z.coerce.number().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(1),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  cover_image: z.string().url().optional().nullable(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  agent_name: z.string().max(100).optional().nullable(),
  agent_phone: z.string().max(30).optional().nullable(),
  owner_name: z.string().max(100).optional().nullable(),
});

const AgentInput = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  specialties: z.array(z.string()).default([]),
  avatar_url: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const adminListProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(PropertyInput)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("properties")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), patch: PropertyInput.partial() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("properties")
      .update(data.patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data } = await context.supabase
      .from("listing_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminGetAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const sb = adminClient() ?? context.supabase;

    const [{ data: properties = [] }, { data: inquiries = [] }, { data: payments = [] }] =
      await Promise.all([
        sb.from("properties").select("id,location,view_count,available,featured").order("created_at", { ascending: false }),
        sb.from("listing_inquiries").select("id").order("created_at", { ascending: false }),
        sb.from("viewing_payments").select("amount,status").order("created_at", { ascending: false }),
      ]);

    const totalViews = (properties as Array<{ view_count?: number }>).reduce(
      (sum, item) => sum + Number(item.view_count ?? 0),
      0,
    );
    const paidPayments = (payments ?? []).filter((item: any) => item.status === "succeeded");
    const paidTotal = paidPayments.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0);
    const locationCounts = (properties ?? []).reduce<Record<string, number>>((acc, item: any) => {
      const key = item.location ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const popularLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalProperties: properties?.length ?? 0,
      totalViews,
      leadsGenerated: inquiries?.length ?? 0,
      paymentsReceived: paidTotal,
      availableProperties: (properties ?? []).filter((item: any) => item.available).length,
      featuredProperties: (properties ?? []).filter((item: any) => item.featured).length,
      popularLocations,
      conversionRate:
        totalViews > 0 ? Number(((inquiries?.length ?? 0) / totalViews) * 100).toFixed(1) : "0.0",
      paymentConversion:
        inquiries?.length > 0
          ? Number((paidPayments.length / (inquiries?.length ?? 1)) * 100).toFixed(1)
          : "0.0",
    };
  });

export const adminListAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const sb = adminClient() ?? context.supabase;
    const { data, error } = await sb.from("agents").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AgentInput)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const sb = adminClient() ?? context.supabase;
    const { data: row, error } = await sb.from("agents").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), patch: AgentInput.partial() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const sb = adminClient() ?? context.supabase;
    const { error } = await sb.from("agents").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const sb = adminClient() ?? context.supabase;
    const { error } = await sb.from("agents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
