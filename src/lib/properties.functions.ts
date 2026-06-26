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

const ListSchema = z
  .object({
    location: z.string().optional(),
    propertyType: z.string().optional(),
    maxRent: z.coerce.number().optional(),
    minRent: z.coerce.number().optional(),
    amenities: z.array(z.string()).optional(),
    featuredOnly: z.boolean().optional(),
    limit: z.coerce.number().min(1).max(60).default(24),
  })
  .partial();

export const listProperties = createServerFn({ method: "GET" })
  .validator(ListSchema)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return [];
    let q = sb
      .from("properties")
      .select(
        "id,slug,title,property_type,location,region,rent,deposit,bedrooms,bathrooms,amenities,cover_image,images,available,featured,viewing_fee",
      )
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 24);
    if (data.location) q = q.eq("location", data.location);
    if (data.propertyType) q = q.eq("property_type", data.propertyType);
    if (data.maxRent) q = q.lte("rent", data.maxRent);
    if (data.minRent) q = q.gte("rent", data.minRent);
    if (data.featuredOnly) q = q.eq("featured", true);
    if (data.amenities && data.amenities.length) q = q.contains("amenities", data.amenities);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getProperty = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return null;
    const { data: row, error } = await sb
      .from("properties")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const recordPropertyView = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true };
    const { data: row, error: fetchError } = await sb
      .from("properties")
      .select("id,view_count")
      .eq("slug", data.slug)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!row) return { ok: true };
    const { error } = await sb
      .from("properties")
      .update({ view_count: Number(row.view_count ?? 0) + 1 })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  if (!sb) {
    return {
      listed: 0,
      available: 0,
      clients: 1200,
      placements: 850,
      regions: 6,
    };
  }
  const { count } = await sb.from("properties").select("*", { count: "exact", head: true });
  const { count: available } = await sb
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("available", true);
  return {
    listed: count ?? 0,
    available: available ?? 0,
    clients: 1200,
    placements: 850,
    regions: 6,
  };
});
