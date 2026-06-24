export const SITE = {
  name: "Umoja Housing Agency",
  shortName: "Umoja",
  tagline: "Finding Your Next Home Has Never Been Easier",
  phone: "+254715842716",
  phoneDisplay: "+254 715 842 716",
  whatsapp: "254715842716",
  email: "info@umojahousing.co.ke",
  address: "Kisii Town, Gusii Region, Kenya",
  regions: ["Kisii", "Nyamira", "Keroka", "Ogembo", "Suneka", "Kisii University", "Daraja Mbili", "Jogoo"],
  propertyTypes: [
    "Single Room",
    "Bedsitter",
    "One Bedroom",
    "Two Bedroom",
    "Three Bedroom",
    "Bungalow",
    "Apartment",
    "Commercial Space",
  ],
  amenities: [
    "Water",
    "WiFi",
    "Parking",
    "Security",
    "Hot Shower",
    "Borehole",
    "Electricity",
    "CCTV",
    "Balcony",
    "Tiled Floor",
  ],
};

export const whatsappLink = (msg?: string) =>
  `https://wa.me/${SITE.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
export const telLink = () => `tel:${SITE.phone}`;

export const formatKsh = (n: number | null | undefined) =>
  n == null ? "—" : `KSh ${n.toLocaleString("en-KE")}`;