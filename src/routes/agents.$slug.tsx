import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Phone, ArrowLeft } from "lucide-react";
import { listAgents } from "@/lib/inquiries.functions";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/agents/$slug")({
  loader: async ({ context, params }) => {
    const query = context.queryClient.ensureQueryData({
      queryKey: ["agents", params.slug],
      queryFn: () => listAgents({ data: { slug: params.slug } }),
    });
    return query;
  },
  component: AgentProfile,
  notFoundComponent: () => <div className="pt-32 pb-20 text-center">Agent not found</div>,
});

function AgentProfile() {
  const { slug } = Route.useParams();
  const listAgent = useServerFn(listAgents);
  const query = useQuery({ queryKey: ["agents", slug], queryFn: () => listAgent({ data: { slug } }) });
  const agent = query.data?.[0];

  if (!agent) return null;

  const msg = `Hello, I'm interested in working with ${agent.name} at Umoja Housing Agency.`;

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-5xl">
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
        <div className="mt-6 rounded-3xl bg-card p-8 shadow-soft grid lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <div>
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {agent.name?.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold">{agent.name}</h1>
            <p className="mt-3 text-muted-foreground">{agent.bio || "Trusted local agent helping clients find verified homes in the Gusii Region."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${agent.phone || SITE.phone}`} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-white"><Phone className="h-4 w-4" /> Call</a>
              <a href={whatsappLink(msg)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </div>
          </div>
          <div className="rounded-3xl border p-6">
            <h2 className="font-display text-xl font-semibold">Contact details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-semibold">{agent.phone || SITE.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-semibold">{agent.email || SITE.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Specialties</dt><dd className="font-semibold">{(agent.specialties ?? []).join(", ") || "Property viewing"}</dd></div>
            </dl>
            <div className="mt-6">
              <h3 className="font-semibold">Areas of focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(agent.specialties ?? []).map((item: string) => <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
