import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="gradient-deep text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <img
            src={logo}
            alt="Umoja Housing Agency"
            className="h-14 w-auto bg-white rounded-xl p-2"
          />
          <p className="text-sm text-white/75 max-w-md">
            Verified houses across Kisii and the wider Gusii Region. We help tenants find their next
            home and landlords reach the right people.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={telLink()}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={whatsappLink("Hello Umoja Housing, I'd like to inquire about a property.")}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-4 py-2 text-sm font-semibold hover:shadow-lift transition"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link to="/properties" className="hover:text-white">
                Properties
              </Link>
            </li>
            <li>
              <Link to="/list-property" className="hover:text-white">
                List Your House
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {SITE.address}
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" /> {SITE.phoneDisplay}
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" /> {SITE.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-white/60 flex flex-wrap items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span>Serving Kisii · Nyamira · Keroka · Ogembo · Suneka</span>
        </div>
      </div>
    </footer>
  );
}
