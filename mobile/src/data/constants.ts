export const SERVICE_CATEGORIES = [
  { id: "electrical", label: "Electrician", glyph: "⚡" },
  { id: "plumbing", label: "Plumber", glyph: "🚿" },
  { id: "ac", label: "AC Technician", glyph: "❄️" },
  { id: "mechanic", label: "Mechanic", glyph: "🔧" },
  { id: "painting", label: "Painter", glyph: "🎨" },
  { id: "carpentry", label: "Carpenter", glyph: "🪚" },
  { id: "appliance", label: "Appliance Repair", glyph: "🧰" },
  { id: "pest", label: "Pest Control", glyph: "🐜" },
] as const;

export const EXPERIENCE_LEVELS = [
  { label: "0–1 years", value: "0-1" },
  { label: "2–4 years", value: "2-4" },
  { label: "5–9 years", value: "5-9" },
  { label: "10+ years", value: "10+" },
];

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export const AREAS_BY_CITY: Record<string, string[]> = {
  Karachi: ["Clifton", "DHA", "Gulshan-e-Iqbal", "North Nazimabad", "Korangi", "Malir"],
  Lahore: ["Gulberg", "DHA", "Model Town", "Johar Town", "Cantt", "Bahria Town"],
  Islamabad: ["F-6", "F-7", "G-11", "I-8", "Bahria Enclave", "DHA-II"],
  Rawalpindi: ["Saddar", "Satellite Town", "Chaklala", "Bahria Town"],
  Faisalabad: ["Peoples Colony", "Madina Town", "Gulberg"],
  Multan: ["Cantt", "Gulgasht", "Shah Rukn-e-Alam"],
  Peshawar: ["Hayatabad", "University Town", "Cantt"],
  Quetta: ["Jinnah Town", "Satellite Town", "Cantt"],
};

export const RADIUS_OPTIONS = [3, 5, 10, 15, 25, 40];

export const LANGUAGES = ["Urdu", "English", "Punjabi", "Sindhi", "Pashto", "Balochi"];

export const BANKS = [
  "HBL",
  "Meezan Bank",
  "UBL",
  "Bank Alfalah",
  "MCB",
  "Standard Chartered",
  "JazzCash",
  "Easypaisa",
];

export const ONBOARDING_SLIDES = [
  {
    glyph: "🧭",
    title: "Jobs that come to you",
    body: "Get matched with verified customers near you. Accept, reschedule or decline — you stay in control of your day.",
  },
  {
    glyph: "💳",
    title: "Get paid, on time",
    body: "Track every job's earnings, see your commission breakdown and withdraw to your bank whenever you like.",
  },
  {
    glyph: "🛡️",
    title: "A verified professional badge",
    body: "Complete verification once and wear the ServicePro badge. Verified technicians earn up to 3× more bookings.",
  },
];
