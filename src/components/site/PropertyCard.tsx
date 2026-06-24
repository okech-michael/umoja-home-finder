import { Link } from "@tanstack/react-router";
import { MapPin, Bed, Bath, Eye } from "lucide-react";
import { formatKsh } from "@/lib/site";

type P = {
  id: string;
  slug: string;
  title: string;
  property_type: string;
  location: string;
  rent: number;
  bedrooms: number | null;
  bathrooms: number | null;
  cover_image: string | null;
  images: string[] | null;
  available: boolean;
  featured: boolean;
  amenities: string[] | null;
};

export function PropertyCard({ p, index = 0 }: { p: P; index?: number }) {
  const img =
    p.cover_image ||
    p.images?.[0] ||
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800";
  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className="group block animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="overflow-hidden rounded-3xl bg-card shadow-soft hover:shadow-lift transition-all duration-500 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {p.featured && (
              <span className="rounded-full gradient-brand px-3 py-1 text-xs font-semibold text-white">
                Featured
              </span>
            )}
            <span className="rounded-full glass px-3 py-1 text-xs font-medium text-foreground">
              {p.property_type}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                p.available ? "bg-emerald-500/95 text-white" : "bg-red-500/90 text-white"
              }`}
            >
              {p.available ? "Available" : "Taken"}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <MapPin className="h-3.5 w-3.5" />
              {p.location}
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {p.title}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {(p.bedrooms ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" /> {p.bedrooms}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {p.bathrooms ?? 1}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="font-display text-lg font-bold text-secondary">
                {formatKsh(p.rent)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {(p.amenities ?? []).slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              <Eye className="h-3.5 w-3.5" /> View
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
