import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { submitContactMessage } from "@/lib/inquiries.functions";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Umoja Housing Agency" },
      {
        name: "description",
        content:
          "Call, WhatsApp or send a message to Umoja Housing Agency. We respond within hours during business days.",
      },
      { property: "og:title", content: "Contact Umoja Housing Agency" },
      { property: "og:description", content: "Get in touch with our team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const send = useServerFn(submitContactMessage);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await send({
        data: {
          full_name: String(fd.get("full_name") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      toast.success("Message sent! We'll be in touch shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-28 pb-20 bg-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto animate-fade-up">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            Contact
          </span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
            We'd love to hear from you
          </h1>
          <p className="mt-3 text-muted-foreground">
            Call us, WhatsApp us, or drop a message — we're quick to reply.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <form onSubmit={onSubmit} className="rounded-3xl bg-card p-8 shadow-soft space-y-4">
            <h2 className="font-display text-2xl font-bold">Send a message</h2>
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
                  name="phone"
                  className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject
              </label>
              <input
                name="subject"
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                required
                name="message"
                rows={5}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 font-semibold text-white shadow-soft hover:shadow-lift transition disabled:opacity-60"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Message <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <aside className="space-y-4">
            <a
              href={telLink()}
              className="block rounded-3xl bg-card p-6 shadow-soft hover:shadow-lift transition group"
            >
              <Phone className="h-7 w-7 text-primary" />
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Call
              </div>
              <div className="font-display text-xl font-semibold group-hover:text-primary transition">
                {SITE.phoneDisplay}
              </div>
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener"
              className="block rounded-3xl bg-card p-6 shadow-soft hover:shadow-lift transition group"
            >
              <MessageCircle className="h-7 w-7 text-primary" />
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                WhatsApp
              </div>
              <div className="font-display text-xl font-semibold group-hover:text-primary transition">
                Chat with us
              </div>
            </a>
            <div className="rounded-3xl bg-card p-6 shadow-soft">
              <Mail className="h-7 w-7 text-primary" />
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </div>
              <div className="font-display text-lg font-semibold">{SITE.email}</div>
            </div>
            <div className="rounded-3xl bg-card p-6 shadow-soft">
              <MapPin className="h-7 w-7 text-primary" />
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Office
              </div>
              <div className="font-display text-lg font-semibold">{SITE.address}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
