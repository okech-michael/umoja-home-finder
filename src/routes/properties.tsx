import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { listProperties } from "@/lib/properties.functions";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SITE } from "@/lib/site";

const searchSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  maxRent: z.coerce.number().optional(),
  q: z.string().optional(),
});

const queryOpts = () =>
  queryOptions({
    queryKey: ["properties", "all"],
    queryFn: () => listProperties({ data: { limit: 60 } }),
  });

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "Browse Properties — Umoja Housing Agency" },
      {
        name: "description",
        content:
          "Search verified houses for rent in Kisii, Nyamira, Keroka, Ogembo and Suneka. Filter by type, location, price, and amenities.",
      },
      { property: "og:title", content: "Browse Properties — Umoja Housing Agency" },
      { property: "og:description", content: "Find your next home in the Gusii Region." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ context }) => context.queryClient.ensureQueryData(queryOpts()),
  component: Properties,
});

function Properties() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(queryOpts());
  const [filters, setFilters] = useState({
    location: search.location ?? "",
    propertyType: search.propertyType ?? "",
    maxRent: search.maxRent ? String(search.maxRent) : "",
    amenities: [] as string[],
    q: search.q ?? "",
  });

  const filtered = useMemo(() => {
    return data.filter((p) => {
      if (filters.location && p.location !== filters.location) return false;
      if (filters.propertyType && p.property_type !== filters.propertyType) return false;
      if (filters.maxRent && p.rent > Number(filters.maxRent)) return false;
      if (
        filters.amenities.length &&
        !filters.amenities.every((a) => (p.amenities ?? []).includes(a))
      )
        return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [data, filters]);

  const toggleAmenity = (a: string) =>
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  return (
    <div className="pt-28 pb-20 bg-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 animate-fade-up">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            Listings
          </span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Browse Properties</h1>
          <p className="mt-2 text-muted-foreground">
            Verified homes across Kisii and the wider Gusii Region.
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 self-start space-y-5 rounded-3xl bg-card p-6 shadow-soft h-fit">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search
              </label>
              <div className="mt-1.5 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  placeholder="Title or area"
                  className="w-full rounded-xl border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                {SITE.regions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                {SITE.propertyTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Rent (KSh)
              </label>
              <input
                value={filters.maxRent}
                onChange={(e) =>
                  setFilters({ ...filters, maxRent: e.target.value.replace(/[^\d]/g, "") })
                }
                placeholder="e.g. 15000"
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amenities
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SITE.amenities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      filters.amenities.includes(a)
                        ? "gradient-brand text-white border-transparent"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters({ location: "", propertyType: "", maxRent: "", amenities: [], q: "" })
              }
              className="w-full rounded-xl border px-3 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Clear all
            </button>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              {data.length} properties
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-16 text-center">
                <p className="text-muted-foreground">No properties match these filters yet.</p>
                <Link to="/contact" className="mt-4 inline-block text-primary font-semibold">
                  Tell us what you're looking for
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, i) => (
                  <PropertyCard key={p.id} p={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
