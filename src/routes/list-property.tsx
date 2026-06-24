import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Award, Building2, CheckCircle2, Send, Users } from "lucide-react";
import { submitListingInquiry } from "@/lib/inquiries.functions";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List Your Property — Umoja Housing Agency" },
      {
        name: "description",
        content:
          "Landlords, list your house with Umoja Housing Agency. Reach verified tenants across Kisii and the Gusii Region quickly and professionally.",
      },
      { property: "og:title", content: "List your property with Umoja" },
      { property: "og:description", content: "Reach verified tenants across the Gusii Region." },
    ],
  }),
  component: ListProperty,
});

const benefits = [
  {
    icon: Users,
    title: "Reach more tenants",
    text: "We market your property to a wide audience of verified renters.",
  },
  {
    icon: Award,
    title: "Professional presentation",
    text: "Quality photos, descriptions and pricing guidance to attract serious clients.",
  },
  {
    icon: Building2,
    title: "End-to-end support",
    text: "We handle viewings, screening and paperwork.",
  },
];
const steps = [
  "Tell us about your property",
  "We inspect & photograph it",
  "We list & market it",
  "You start receiving viewings",
];

function ListProperty() {
  const submit = useServerFn(submitListingInquiry);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          full_name: String(fd.get("full_name") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
          location: String(fd.get("location") || ""),
          property_type: String(fd.get("property_type") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      toast.success("Submitted! Our agent will call you shortly.");
      setDone(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-28 pb-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="text-xs uppercase tracking-widest font-semibold text-primary">
              For Landlords
            </span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold text-balance">
              List your house with the trusted agency in the Gusii Region.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Reach verified tenants quickly. We handle inspections, photography, marketing and
              viewings — you focus on rent.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl bg-card p-5 shadow-soft border-t-2 border-primary"
                >
                  <b.icon className="h-6 w-6 text-primary" />
                  <div className="mt-2 font-semibold text-sm">{b.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{b.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <h3 className="font-display text-xl font-semibold">How it works</h3>
              <ol className="mt-4 space-y-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="h-7 w-7 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-1">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-8 shadow-lift">
            {done ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
                <h2 className="mt-4 font-display text-2xl font-bold">Thank you!</h2>
                <p className="mt-2 text-muted-foreground">
                  Your inquiry has been received. An agent will contact you within a few hours.
                </p>
                <button
                  onClick={() => setDone(false)}
                  className="mt-6 rounded-full border px-5 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h2 className="font-display text-2xl font-bold">Tell us about your property</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full name
                    </label>
                    <input
                      required
                      name="full_name"
                      className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone
                    </label>
                    <input
                      required
                      name="phone"
                      className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Location
                    </label>
                    <select
                      required
                      name="location"
                      className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select…</option>
                      {SITE.regions.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Property type
                    </label>
                    <select
                      name="property_type"
                      className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select…</option>
                      {SITE.propertyTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tell us more
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Number of units, rent expectation, any details…"
                    className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 font-semibold text-white shadow-soft hover:shadow-lift transition disabled:opacity-60"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      List My Property <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
