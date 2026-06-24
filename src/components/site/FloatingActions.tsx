import { Phone, MessageCircle } from "lucide-react";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={whatsappLink("Hello Umoja Housing Agency, I'd like to inquire.")}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        className="group h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lift hover:scale-110 transition-transform animate-float"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={telLink()}
        aria-label={`Call ${SITE.name}`}
        className="h-14 w-14 rounded-full gradient-brand text-white flex items-center justify-center shadow-lift hover:scale-110 transition-transform"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}