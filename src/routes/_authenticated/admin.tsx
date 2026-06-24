import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Home,
  MessageSquare,
  BarChart3,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import {
  adminListProperties,
  adminCreateProperty,
  adminUpdateProperty,
  adminDeleteProperty,
  checkIsAdmin,
  adminListInquiries,
  adminListMessages,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE, formatKsh } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Umoja" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `p-${Date.now()}`
  );
}

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(adminListProperties);
  const create = useServerFn(adminCreateProperty);
  const update = useServerFn(adminUpdateProperty);
  const del = useServerFn(adminDeleteProperty);
  const checkAdmin = useServerFn(checkIsAdmin);
  const listInq = useServerFn(adminListInquiries);
  const listMsg = useServerFn(adminListMessages);

  const [tab, setTab] = useState<"properties" | "inquiries" | "messages">("properties");

  const adminQ = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });
  const props = useQuery({
    queryKey: ["admin", "props"],
    queryFn: () => list(),
    enabled: !!adminQ.data?.isAdmin,
  });
  const inquiries = useQuery({
    queryKey: ["admin", "inq"],
    queryFn: () => listInq(),
    enabled: tab === "inquiries" && !!adminQ.data?.isAdmin,
  });
  const messages = useQuery({
    queryKey: ["admin", "msg"],
    queryFn: () => listMsg(),
    enabled: tab === "messages" && !!adminQ.data?.isAdmin,
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const save = useMutation({
    mutationFn: async (data: any) => {
      if (editing?.id) return update({ data: { id: editing.id, patch: data } });
      return create({ data });
    },
    onSuccess: () => {
      toast.success(editing?.id ? "Property updated" : "Property created");
      qc.invalidateQueries({ queryKey: ["admin", "props"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Property deleted");
      qc.invalidateQueries({ queryKey: ["admin", "props"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  if (adminQ.isLoading) {
    return <div className="pt-32 text-center text-muted-foreground">Loading…</div>;
  }

  if (!adminQ.data?.isAdmin) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-xl mx-auto">
        <div className="rounded-3xl bg-card p-10 shadow-soft text-center">
          <ShieldAlert className="h-12 w-12 mx-auto text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but does not have admin privileges. Ask an existing admin to
            grant you the role, or contact {SITE.email}.
          </p>
          <button
            onClick={signOut}
            className="mt-6 rounded-full border px-5 py-2 text-sm font-semibold hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const properties = props.data ?? [];
  const stats = {
    total: properties.length,
    available: properties.filter((p: any) => p.available).length,
    featured: properties.filter((p: any) => p.featured).length,
    inquiries: inquiries.data?.length ?? 0,
  };

  return (
    <div className="pt-24 pb-20 bg-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage properties, inquiries and messages.
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Properties", v: stats.total, icon: Home },
            { label: "Available", v: stats.available, icon: BarChart3 },
            { label: "Featured", v: stats.featured, icon: BarChart3 },
            { label: "Listing Inquiries", v: stats.inquiries, icon: Inbox },
          ].map((s: { label: string; v: number; icon: any }) => (
            <div key={s.label} className="rounded-2xl bg-card p-5 shadow-soft">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 text-2xl font-bold font-display">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "properties", label: "Properties", icon: Home },
            { id: "inquiries", label: "Listing Inquiries", icon: Inbox },
            { id: "messages", label: "Contact Messages", icon: MessageSquare },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "gradient-brand text-white" : "bg-card hover:bg-muted"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "properties" && (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Properties</h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 rounded-full gradient-brand text-white px-4 py-2 text-sm font-semibold hover:shadow-lift transition"
              >
                <Plus className="h-4 w-4" /> New Property
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Rent</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-3 pr-3 font-semibold">{p.title}</td>
                      <td className="py-3 pr-3">{p.property_type}</td>
                      <td className="py-3 pr-3">{p.location}</td>
                      <td className="py-3 pr-3 font-semibold">{formatKsh(p.rent)}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 ${p.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.available ? "Available" : "Taken"}
                        </span>
                      </td>
                      <td className="py-3 pr-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirm(`Delete "${p.title}"?`) && remove.mutate(p.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {properties.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">
                        No properties yet. Add your first listing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "inquiries" && (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold mb-4">Listing Inquiries</h2>
            <div className="space-y-3">
              {(inquiries.data ?? []).map((i: any) => (
                <div key={i.id} className="rounded-2xl border p-4">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <div className="font-semibold">
                        {i.full_name}{" "}
                        <span className="text-muted-foreground font-normal">· {i.phone}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {i.location} · {i.property_type ?? "—"} ·{" "}
                        {new Date(i.created_at).toLocaleString()}
                      </div>
                    </div>
                    <a href={`tel:${i.phone}`} className="text-xs font-semibold text-primary">
                      Call
                    </a>
                  </div>
                  {i.message && <p className="mt-2 text-sm text-muted-foreground">{i.message}</p>}
                </div>
              ))}
              {!(inquiries.data ?? []).length && (
                <div className="text-center py-10 text-muted-foreground">No inquiries yet.</div>
              )}
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold mb-4">Contact Messages</h2>
            <div className="space-y-3">
              {(messages.data ?? []).map((m: any) => (
                <div key={m.id} className="rounded-2xl border p-4">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <div className="font-semibold">
                        {m.full_name}{" "}
                        {m.email && (
                          <span className="text-muted-foreground font-normal">· {m.email}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.subject || "No subject"} · {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{m.message}</p>
                </div>
              ))}
              {!(messages.data ?? []).length && (
                <div className="text-center py-10 text-muted-foreground">No messages yet.</div>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <PropertyForm
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={(d) => save.mutate(d)}
            saving={save.isPending}
          />
        )}
      </div>
    </div>
  );
}

function PropertyForm({
  initial,
  onCancel,
  onSubmit,
  saving,
}: {
  initial: any;
  onCancel: () => void;
  onSubmit: (d: any) => void;
  saving: boolean;
}) {
  const [imageInput, setImageInput] = useState<string>(
    ((initial?.images ?? []) as string[]).join("\n"),
  );
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "");
    const images = imageInput
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    onSubmit({
      title,
      slug: String(fd.get("slug") || slugify(title)),
      description: String(fd.get("description") || ""),
      property_type: String(fd.get("property_type") || "Bedsitter"),
      location: String(fd.get("location") || ""),
      region: String(fd.get("region") || "Gusii"),
      address: String(fd.get("address") || ""),
      rent: Number(fd.get("rent") || 0),
      deposit: Number(fd.get("deposit") || 0) || null,
      viewing_fee: Number(fd.get("viewing_fee") || 300),
      bedrooms: Number(fd.get("bedrooms") || 0),
      bathrooms: Number(fd.get("bathrooms") || 1),
      cover_image: images[0] || null,
      images,
      amenities,
      available: fd.get("available") === "on",
      featured: fd.get("featured") === "on",
      agent_name: String(fd.get("agent_name") || SITE.name),
      agent_phone: String(fd.get("agent_phone") || SITE.phone),
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handle}
        className="w-full max-w-3xl bg-card rounded-3xl p-6 shadow-lift my-8 space-y-4"
      >
        <h3 className="font-display text-2xl font-bold">
          {initial?.id ? "Edit property" : "New property"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title" name="title" defaultValue={initial?.title} required />
          <Field
            label="Slug (URL)"
            name="slug"
            defaultValue={initial?.slug}
            placeholder="auto-generated"
          />
          <Select
            label="Type"
            name="property_type"
            defaultValue={initial?.property_type ?? "Bedsitter"}
            options={SITE.propertyTypes}
          />
          <Select
            label="Location"
            name="location"
            defaultValue={initial?.location ?? SITE.regions[0]}
            options={SITE.regions}
          />
          <Field label="Address" name="address" defaultValue={initial?.address} />
          <Field label="Region" name="region" defaultValue={initial?.region ?? "Gusii"} />
          <Field
            label="Rent (KSh)"
            name="rent"
            type="number"
            defaultValue={initial?.rent ?? 0}
            required
          />
          <Field
            label="Deposit (KSh)"
            name="deposit"
            type="number"
            defaultValue={initial?.deposit ?? 0}
          />
          <Field
            label="Viewing Fee (KSh)"
            name="viewing_fee"
            type="number"
            defaultValue={initial?.viewing_fee ?? 300}
          />
          <Field
            label="Bedrooms"
            name="bedrooms"
            type="number"
            defaultValue={initial?.bedrooms ?? 0}
          />
          <Field
            label="Bathrooms"
            name="bathrooms"
            type="number"
            defaultValue={initial?.bathrooms ?? 1}
          />
          <Field
            label="Agent name"
            name="agent_name"
            defaultValue={initial?.agent_name ?? SITE.name}
          />
          <Field
            label="Agent phone"
            name="agent_phone"
            defaultValue={initial?.agent_phone ?? SITE.phone}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ""}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Image URLs (one per line — first is cover)
          </label>
          <textarea
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            rows={3}
            placeholder="https://..."
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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
                onClick={() =>
                  setAmenities((arr) =>
                    arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a],
                  )
                }
                className={`rounded-full px-3 py-1 text-xs font-medium border transition ${amenities.includes(a) ? "gradient-brand text-white border-transparent" : "hover:bg-muted"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="available" defaultChecked={initial?.available ?? true} />{" "}
            Available
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />{" "}
            Featured
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-full gradient-brand text-white px-6 py-2.5 text-sm font-semibold hover:shadow-lift transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text", required, placeholder }: any) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
function Select({ label, name, defaultValue, options }: any) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
