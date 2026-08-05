import iconElectrical from "@/assets/icon-electrical.png";
import iconPlumbing from "@/assets/icon-plumbing.png";
import iconAc from "@/assets/icon-ac.png";
import iconCarpentry from "@/assets/icon-carpentry.png";
import iconPainting from "@/assets/icon-painting.png";
import iconCleaning from "@/assets/icon-cleaning.png";

export type Service = {
  slug: string;
  title: string;
  description: string;
  startingPrice: number;
  eta: string;
  icon: string;
  category: string;
};

export const services: Service[] = [
  { slug: "electrical", title: "Electrical", description: "Certified electricians for wiring, fixtures, and emergency repairs.", startingPrice: 49, eta: "45 min", icon: iconElectrical, category: "Home" },
  { slug: "plumbing", title: "Plumbing", description: "Leak repair, pipe replacement, and installation by licensed plumbers.", startingPrice: 59, eta: "40 min", icon: iconPlumbing, category: "Home" },
  { slug: "air-conditioning", title: "Air Conditioning", description: "AC installation, servicing, and gas refilling for all major brands.", startingPrice: 79, eta: "60 min", icon: iconAc, category: "Home" },
  { slug: "carpentry", title: "Carpentry", description: "Custom woodwork, furniture repair, and installations.", startingPrice: 45, eta: "55 min", icon: iconCarpentry, category: "Home" },
  { slug: "painting", title: "Painting", description: "Interior and exterior painting with premium finishes.", startingPrice: 120, eta: "Same day", icon: iconPainting, category: "Home" },
  { slug: "cleaning", title: "Deep Cleaning", description: "Professional home and office cleaning teams.", startingPrice: 89, eta: "50 min", icon: iconCleaning, category: "Home" },
  { slug: "pest-control", title: "Pest Control", description: "Safe, effective treatments for all common pests.", startingPrice: 99, eta: "1 hr", icon: iconCleaning, category: "Home" },
  { slug: "appliance-repair", title: "Appliance Repair", description: "Fridge, washing machine, oven, microwave and more.", startingPrice: 69, eta: "45 min", icon: iconElectrical, category: "Home" },
  { slug: "mechanic", title: "Mechanic", description: "On-site auto mechanics for breakdowns and diagnostics.", startingPrice: 89, eta: "50 min", icon: iconCarpentry, category: "Auto" },
  { slug: "generator-repair", title: "Generator Repair", description: "Emergency generator servicing and part replacement.", startingPrice: 129, eta: "1 hr", icon: iconAc, category: "Home" },
];

export type Technician = {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  experienceYears: number;
  completedJobs: number;
  specializations: string[];
  languages: string[];
  city: string;
  available: boolean;
  hourlyRate: number;
  bio: string;
  certificates: string[];
};

const avatar = (seed: string) => `https://i.pravatar.cc/240?u=${seed}`;

export const technicians: Technician[] = [
  { id: "t1", slug: "marcus-chen", name: "Marcus Chen", avatar: avatar("marcus"), rating: 4.9, reviews: 312, experienceYears: 9, completedJobs: 1240, specializations: ["Electrical", "Smart Home"], languages: ["English", "Mandarin"], city: "San Francisco", available: true, hourlyRate: 65, bio: "Licensed master electrician with a decade of residential and light-commercial experience. Smart-home certified.", certificates: ["Master Electrician License", "NABCEP Certified", "OSHA 30"] },
  { id: "t2", slug: "amina-yusuf", name: "Amina Yusuf", avatar: avatar("amina"), rating: 5.0, reviews: 189, experienceYears: 7, completedJobs: 860, specializations: ["Plumbing", "Water Systems"], languages: ["English", "Arabic"], city: "Austin", available: true, hourlyRate: 60, bio: "Journey-level plumber specializing in leak detection and tankless water heaters.", certificates: ["Journeyman Plumber", "Backflow Certified"] },
  { id: "t3", slug: "diego-alvarez", name: "Diego Alvarez", avatar: avatar("diego"), rating: 4.8, reviews: 421, experienceYears: 12, completedJobs: 1810, specializations: ["HVAC", "Refrigeration"], languages: ["English", "Spanish"], city: "Miami", available: false, hourlyRate: 72, bio: "HVAC specialist for residential AC systems and commercial refrigeration.", certificates: ["EPA 608 Universal", "NATE Certified"] },
  { id: "t4", slug: "priya-natarajan", name: "Priya Natarajan", avatar: avatar("priya"), rating: 4.9, reviews: 267, experienceYears: 6, completedJobs: 720, specializations: ["Appliance Repair"], languages: ["English", "Tamil", "Hindi"], city: "Seattle", available: true, hourlyRate: 55, bio: "Factory-trained on Samsung, LG, and Whirlpool appliances.", certificates: ["Samsung Certified", "PSA Master Tech"] },
  { id: "t5", slug: "james-oconnell", name: "James O'Connell", avatar: avatar("james"), rating: 4.7, reviews: 158, experienceYears: 15, completedJobs: 2050, specializations: ["Carpentry", "Renovations"], languages: ["English"], city: "Boston", available: true, hourlyRate: 68, bio: "Third-generation carpenter with a portfolio of custom built-ins and renovations.", certificates: ["Licensed Contractor"] },
  { id: "t6", slug: "sofia-rossi", name: "Sofia Rossi", avatar: avatar("sofia"), rating: 4.9, reviews: 203, experienceYears: 8, completedJobs: 940, specializations: ["Painting", "Finishes"], languages: ["English", "Italian"], city: "New York", available: true, hourlyRate: 58, bio: "Fine-finish painter with a decorative arts background.", certificates: ["PDCA Certified"] },
];

export const testimonials = [
  { id: 1, name: "Jordan Blake", role: "Homeowner, Austin", avatar: avatar("jordan"), rating: 5, quote: "Booked a plumber at 9pm on a Sunday. Amina arrived in 35 minutes, fixed the leak, and cleaned up. It felt like magic." },
  { id: 2, name: "Rina Patel", role: "Property Manager, Seattle", avatar: avatar("rina"), rating: 5, quote: "We manage 40 units. ServicePro replaced three vendors — the SLA reporting alone is worth it." },
  { id: 3, name: "Michael Grant", role: "Small Business Owner, NYC", avatar: avatar("michael"), rating: 5, quote: "The technician quality is genuinely a step above. Vetted, insured, and they actually show up on time." },
  { id: 4, name: "Elena Torres", role: "Homeowner, Miami", avatar: avatar("elena"), rating: 4, quote: "The live tracking took the anxiety out of waiting. I could plan my afternoon around a real ETA." },
];

export const trustedCompanies = ["Northwind", "Acme Realty", "Contoso", "Globex", "Initech", "Umbrella", "Wayne Enterprises"];

export const pricingPlans = [
  { id: "basic", name: "Basic Visit", price: 49, cadence: "per visit", description: "Single service call with a verified technician.", features: ["60-min service window", "Verified & insured pro", "In-app messaging", "30-day workmanship warranty"], recommended: false },
  { id: "emergency", name: "Emergency Visit", price: 129, cadence: "per visit", description: "24/7 priority dispatch for urgent issues.", features: ["Under 60-min response", "Priority routing", "24/7 availability", "Weekend & holiday coverage", "Live GPS tracking"], recommended: true },
  { id: "annual", name: "Annual Maintenance", price: 39, cadence: "per month", description: "Quarterly preventive visits plus discounted repairs.", features: ["4 visits per year", "15% off all repairs", "Priority booking", "Seasonal HVAC tune-up", "Dedicated account manager"], recommended: false },
];

export const faqs = [
  { q: "How quickly can a technician arrive?", a: "Standard bookings are dispatched within 45 minutes in most metro areas. Emergency service targets under 60 minutes, 24/7." },
  { q: "Are your technicians insured and background-checked?", a: "Every ServicePro technician passes identity verification, a background check, license validation, and carries $1M liability insurance." },
  { q: "How is pricing determined?", a: "You see a starting rate before booking. Final pricing is confirmed on-site with a written estimate — never charged without your approval." },
  { q: "What areas do you serve?", a: "We operate in 42 US metro areas and are expanding monthly. Enter your postal code at checkout to confirm availability." },
  { q: "Do you offer a warranty?", a: "Yes — all workmanship is covered by a 30-day guarantee. Annual plan members receive a 90-day guarantee." },
  { q: "Can I choose my technician?", a: "Absolutely. Browse verified profiles, ratings, and specializations, and request a specific pro at booking." },
  { q: "How do payments work?", a: "Cards are authorized at booking and charged only after service completion. We accept Visa, Mastercard, Amex, and Apple Pay." },
  { q: "What happens if I need to cancel?", a: "Cancel free up to 2 hours before your scheduled window. Late cancellations incur a small dispatch fee." },
  { q: "Do you handle commercial properties?", a: "Yes — our Business plan supports multi-site accounts, invoicing, and SLA reporting." },
  { q: "How do I become a ServicePro technician?", a: "Apply from the Become a Technician page. You'll need a valid trade license, ID, insurance, and a smartphone." },
];

export const bookingSteps = [
  "Choose Service",
  "Choose Technician",
  "Select Date",
  "Service Address",
  "Upload Images",
  "Summary",
];

export const bookingStatuses = [
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "accepted", label: "Accepted" },
  { key: "travelling", label: "Travelling" },
  { key: "arrived", label: "Arrived" },
  { key: "working", label: "Working" },
  { key: "completed", label: "Completed" },
];
