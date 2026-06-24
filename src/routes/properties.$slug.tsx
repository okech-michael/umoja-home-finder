import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Bath,
  Bed,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  Wallet,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { getProperty, listProperties } from "@/lib/properties.functions";
import { formatKsh, SITE, telLink, whatsappLink } from "@/lib/site";
import { PropertyCard } from "@/components/site/PropertyCard";

const propQuery = (slug: string) =>
  queryOptions({ queryKey: ["property", slug], queryFn: () => getProperty({ data: { slug } }) });
const relatedQuery = () =>
  queryOptions({
    queryKey: ["properties", "related"],
    queryFn: () => listProperties({ data: { limit: 6 } }),
  });

export const Route = createFileRoute("/properties/$slug")({
  head: ({ loaderData }: { loaderData?: any }) => ({
    meta: [
      {
        title: loaderData?.title
          ? `${loaderData.title} — Umoja Housing Agency`
          : "Property — Umoja Housing Agency",
      },
      {
        name: "description",
        content:
          loaderData?.description?.slice(0, 160) ??
          "Verified property listing in the Gusii Region.",
      },
      { property: "og:title", content: loaderData?.title ?? "Property" },
      { property: "og:description", content: loaderData?.description?.slice(0, 160) ?? "" },
      { property: "og:image", content: loaderData?.cover_image ?? loaderData?.images?.[0] ?? "" },
    ],
  }),
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(propQuery(params.slug));
    if (!p) throw notFound();
    await context.queryClient.ensureQueryData(relatedQuery());
    return p;
  },
  component: PropertyDetail,
  notFoundComponent: () => (
    <div className="pt-32 pb-20 text-center">
      <h1 className="font-display text-3xl font-bold">Property not found</h1>
      <Link to="/properties" className="mt-4 inline-block text-primary font-semibold">
        Back to listings
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="pt-32 pb-20 text-center">
      <h1 className="font-display text-3xl font-bold">Could not load property</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function PropertyDetail() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(propQuery(slug));
  const { data: related } = useSuspenseQuery(relatedQuery());
  const [active, setActive] = useState(0);

  if (!p) return null;
  const images = p.images?.length ? p.images : p.cover_image ? [p.cover_image] : [];
  const cover =
    images[active] ?? "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200";
  const msg = `Hello, I'm interested in "${p.title}" listed by Umoja Housing Agency.`;

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
              <img src={cover} alt={p.title} className="h-full w-full object-cover" />
              <span
                className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold ${p.available ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
              >
                {p.available ? "Available" : "Taken"}
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActive(i)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition ${i === active ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img} className="h-full w-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                  {p.property_type}
                </span>
                {p.featured && (
                  <span className="rounded-full gradient-brand text-white px-3 py-1 text-xs font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
                {p.title}
              </h1>
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {p.location} · {p.region}
              </div>
            </div>

            <div className="rounded-3xl gradient-deep text-white p-6 shadow-lift">
              <div className="text-sm text-white/70">Monthly Rent</div>
              <div className="font-display text-4xl font-bold">{formatKsh(p.rent)}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Bed className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs text-white/70">Bedrooms</div>
                  <div className="font-semibold">{p.bedrooms ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Bath className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs text-white/70">Bath</div>
                  <div className="font-semibold">{p.bathrooms ?? 1}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Wallet className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs text-white/70">Deposit</div>
                  <div className="font-semibold text-sm">
                    {p.deposit ? formatKsh(p.deposit) : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <a
                href={`tel:${p.agent_phone || SITE.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-full gradient-brand px-6 py-4 font-semibold text-white shadow-soft hover:shadow-lift transition"
              >
                <Phone className="h-4 w-4" /> Call Agent
              </a>
              <a
                href={whatsappLink(msg)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white px-6 py-4 font-semibold hover:opacity-90 transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Agent
              </a>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-secondary text-secondary px-6 py-4 font-semibold hover:bg-secondary hover:text-white transition"
                disabled
              >
                <Eye className="h-4 w-4" /> Pay Viewing Fee · {formatKsh(p.viewing_fee)}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                M-Pesa STK Push coming soon. For now please call or WhatsApp the agent.
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-card p-8 shadow-soft">
            <h2 className="font-display text-2xl font-bold">About this property</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
              {p.description ||
                "Beautifully presented property in a convenient location. Contact the agent for full details and a viewing."}
            </p>
            <h3 className="mt-8 font-display text-xl font-semibold">Amenities</h3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(p.amenities ?? []).length === 0 && (
                <span className="text-sm text-muted-foreground">Contact agent for details</span>
              )}
              {(p.amenities ?? []).map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {a}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Verified by Umoja
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team has inspected this property. Address details are shared after viewing fee
              confirmation.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Property Type</dt>
                <dd className="font-semibold">{p.property_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-semibold">{p.location}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rent</dt>
                <dd className="font-semibold">{formatKsh(p.rent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Deposit</dt>
                <dd className="font-semibold">{formatKsh(p.deposit ?? null)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Viewing Fee</dt>
                <dd className="font-semibold">{formatKsh(p.viewing_fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Agent</dt>
                <dd className="font-semibold">{p.agent_name ?? "Umoja Agent"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Related */}
        <div className="mt-20">
          <h2 className="font-display text-3xl font-bold mb-8">Similar properties</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related
              .filter((r) => r.id !== p.id)
              .slice(0, 3)
              .map((r, i) => (
                <PropertyCard key={r.id} p={r} index={i} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
