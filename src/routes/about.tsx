import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Target, Telescope, HeartHandshake } from "lucide-react";
import { SITE } from "@/lib/site";
import hero1 from "@/assets/hero-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Umoja Housing Agency" },
      {
        name: "description",
        content:
          "Learn about Umoja Housing Agency — serving Kisii, Nyamira, Keroka, Ogembo, Suneka and the wider Gusii Region with verified rental listings and trusted agents.",
      },
      { property: "og:title", content: "About Umoja Housing Agency" },
      { property: "og:description", content: "Verified housing across the Gusii Region." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="pt-20">
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden flex items-end">
        <img
          src={hero1}
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pb-16 text-white">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            About Us
          </span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-bold max-w-3xl text-balance">
            A housing agency built on trust and local roots.
          </h1>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="prose-lg">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Our Story</h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {SITE.name} was founded to make finding a home in Kisii and the wider Gusii Region
              simple, transparent, and trustworthy. We saw too many tenants frustrated by unverified
              listings and landlords struggling to fill vacant units. We exist to connect them
              properly.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Today we serve Kisii, Nyamira, Keroka, Ogembo, Suneka and surrounding areas — with
              plans to grow across the entire Nyanza Region.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-card p-8 shadow-soft border-l-4 border-primary">
              <Target className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-display text-2xl font-bold">Our Mission</h3>
              <p className="mt-2 text-muted-foreground">
                To make every home-search experience transparent, fast, and dignified — for tenants
                and landlords alike.
              </p>
            </div>
            <div className="rounded-3xl bg-card p-8 shadow-soft border-l-4 border-secondary">
              <Telescope className="h-8 w-8 text-secondary" />
              <h3 className="mt-3 font-display text-2xl font-bold">Our Vision</h3>
              <p className="mt-2 text-muted-foreground">
                To be the most trusted property platform across the Nyanza Region within five years.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
              <MapPin className="h-7 w-7 text-primary" /> Where we operate
            </h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SITE.regions.map((r) => (
                <div
                  key={r}
                  className="rounded-2xl bg-card border p-5 shadow-soft hover:shadow-lift transition flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-semibold">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-3xl gradient-deep text-white p-10 md:p-14 shadow-lift">
            <HeartHandshake className="h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">Community first</h2>
            <p className="mt-3 text-white/80 max-w-2xl">
              We're part of the communities we serve. Every viewing, every move-in, every
              recommendation is a chance to strengthen housing in the Gusii Region.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-secondary px-6 py-3 font-semibold hover:bg-white/90 transition"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
