import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Card, Chip, ChipGroup, Input, Row, Select, UploadCard } from "@/components";
import {
  AREAS_BY_CITY,
  BANKS,
  CITIES,
  EXPERIENCE_LEVELS,
  LANGUAGES,
  RADIUS_OPTIONS,
  SERVICE_CATEGORIES,
} from "@/data/constants";
import type { RegistrationData } from "@/types/registration";

export type StepCtx = {
  data: RegistrationData;
  set: (patch: Partial<RegistrationData>) => void;
  pick: (field: keyof RegistrationData, name: string) => void;
};

export type StepDef = {
  key: string;
  title: string;
  subtitle: string;
  valid: (d: RegistrationData) => boolean;
  render: (ctx: StepCtx) => React.ReactNode;
};

const toggle = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

function Muted({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[typography.caption, { color: colors.textMuted }]}>{children}</Text>;
}

export const STEPS: StepDef[] = [
  {
    key: "personal",
    title: "Personal information",
    subtitle: "Use your details exactly as they appear on your CNIC.",
    valid: (d) => !!d.firstName && !!d.lastName && d.cnic.replace(/\D/g, "").length === 13 && !!d.dateOfBirth,
    render: ({ data, set }) => (
      <>
        <Input label="First name" required value={data.firstName} onChangeText={(v) => set({ firstName: v })} placeholder="Ahmed" />
        <Input label="Last name" required value={data.lastName} onChangeText={(v) => set({ lastName: v })} placeholder="Raza" />
        <Input label="CNIC number" required keyboardType="number-pad" value={data.cnic} onChangeText={(v) => set({ cnic: v })} placeholder="42101-1234567-8" hint="13 digits, no spaces required" />
        <Input label="Date of birth" required value={data.dateOfBirth} onChangeText={(v) => set({ dateOfBirth: v })} placeholder="DD / MM / YYYY" />
        <Select label="Gender" value={data.gender} onChange={(v) => set({ gender: v })} options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Prefer not to say", value: "na" }]} />
      </>
    ),
  },
  {
    key: "contact",
    title: "Contact information",
    subtitle: "We use this to reach you about jobs and verification.",
    valid: (d) => d.phone.replace(/\D/g, "").length >= 10 && /\S+@\S+\.\S+/.test(d.email) && !!d.address,
    render: ({ data, set }) => (
      <>
        <Input label="Mobile number" required keyboardType="phone-pad" value={data.phone} onChangeText={(v) => set({ phone: v })} placeholder="+92 300 1234567" />
        <Input label="Alternate number" keyboardType="phone-pad" value={data.altPhone} onChangeText={(v) => set({ altPhone: v })} placeholder="Optional" />
        <Input label="Email address" required keyboardType="email-address" autoCapitalize="none" value={data.email} onChangeText={(v) => set({ email: v })} placeholder="you@example.com" />
        <Input label="Residential address" required multiline value={data.address} onChangeText={(v) => set({ address: v })} placeholder="House / street / area" />
      </>
    ),
  },
  {
    key: "professional",
    title: "Professional information",
    subtitle: "Tell customers what you do best.",
    valid: (d) => d.headline.length >= 4 && d.bio.length >= 30 && d.languages.length > 0,
    render: ({ data, set }) => (
      <>
        <Input label="Professional headline" required value={data.headline} onChangeText={(v) => set({ headline: v })} placeholder="Senior AC technician" />
        <Input label="About you" required multiline value={data.bio} onChangeText={(v) => set({ bio: v })} placeholder="Describe your experience, specialities and the brands you work with." hint={`${data.bio.length}/500 · minimum 30 characters`} maxLength={500} />
        <View style={{ gap: spacing.sm }}>
          <Muted>Languages spoken *</Muted>
          <ChipGroup>
            {LANGUAGES.map((l) => (
              <Chip key={l} label={l} selected={data.languages.includes(l)} onPress={() => set({ languages: toggle(data.languages, l) })} />
            ))}
          </ChipGroup>
        </View>
      </>
    ),
  },
  {
    key: "categories",
    title: "Service categories",
    subtitle: "Pick every trade you're qualified to work in.",
    valid: (d) => d.categories.length > 0,
    render: ({ data, set }) => (
      <View style={{ gap: spacing.sm }}>
        <Muted>Select one or more *</Muted>
        <ChipGroup>
          {SERVICE_CATEGORIES.map((c) => (
            <Chip key={c.id} label={`${c.glyph}  ${c.label}`} selected={data.categories.includes(c.id)} onPress={() => set({ categories: toggle(data.categories, c.id) })} />
          ))}
        </ChipGroup>
      </View>
    ),
  },
  {
    key: "experience",
    title: "Experience",
    subtitle: "Verified experience raises your ranking in search.",
    valid: (d) => !!d.experienceLevel,
    render: ({ data, set }) => (
      <>
        <View style={{ gap: spacing.sm }}>
          <Muted>Years of experience *</Muted>
          <ChipGroup>
            {EXPERIENCE_LEVELS.map((e) => (
              <Chip key={e.value} label={e.label} selected={data.experienceLevel === e.value} onPress={() => set({ experienceLevel: e.value })} />
            ))}
          </ChipGroup>
        </View>
        <Input label="Most recent employer or workshop" value={data.lastEmployer} onChangeText={(v) => set({ lastEmployer: v })} placeholder="Optional" />
      </>
    ),
  },
  {
    key: "areas",
    title: "Working areas",
    subtitle: "Choose your city, then the areas you can reach easily.",
    valid: (d) => !!d.city && d.areas.length > 0,
    render: ({ data, set }) => (
      <>
        <Select label="City" required value={data.city} onChange={(v) => set({ city: v, areas: [] })} options={CITIES.map((c) => ({ label: c, value: c }))} />
        <View style={{ gap: spacing.sm }}>
          <Muted>Areas you cover *</Muted>
          <ChipGroup>
            {(AREAS_BY_CITY[data.city] ?? []).map((a) => (
              <Chip key={a} label={a} selected={data.areas.includes(a)} onPress={() => set({ areas: toggle(data.areas, a) })} />
            ))}
          </ChipGroup>
          {!data.city ? <Muted>Select a city to see its areas.</Muted> : null}
        </View>
      </>
    ),
  },
  {
    key: "radius",
    title: "Working radius",
    subtitle: "How far are you willing to travel for a job?",
    valid: (d) => d.radiusKm > 0,
    render: ({ data, set }) => (
      <>
        <ChipGroup>
          {RADIUS_OPTIONS.map((r) => (
            <Chip key={r} label={`${r} km`} selected={data.radiusKm === r} onPress={() => set({ radiusKm: r })} />
          ))}
        </ChipGroup>
        <Card title="Coverage preview" subtitle="Map preview appears once location permission is granted.">
          <View style={{ height: 160, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 40 }}>🗺️</Text>
            <Muted>
              {data.city ? `${data.radiusKm} km around ${data.city}` : `${data.radiusKm} km radius`}
            </Muted>
          </View>
        </Card>
      </>
    ),
  },
  {
    key: "cnic",
    title: "Upload CNIC",
    subtitle: "Both sides, sharp and fully inside the frame.",
    valid: (d) => !!d.cnicFront && !!d.cnicBack,
    render: ({ data, pick }) => (
      <>
        <UploadCard title="CNIC — front" description="JPG or PNG, max 5 MB" glyph="🪪" required value={data.cnicFront} onPick={() => pick("cnicFront", "cnic-front.jpg")} />
        <UploadCard title="CNIC — back" description="JPG or PNG, max 5 MB" glyph="🪪" required value={data.cnicBack} onPick={() => pick("cnicBack", "cnic-back.jpg")} />
      </>
    ),
  },
  {
    key: "selfie",
    title: "Upload selfie",
    subtitle: "We match this against your CNIC photo.",
    valid: (d) => !!d.selfie,
    render: ({ data, pick }) => (
      <>
        <UploadCard title="Live selfie" description="Face the camera in good light, no cap or sunglasses" glyph="🤳" required value={data.selfie} onPick={() => pick("selfie", "selfie.jpg")} />
        <Card title="Tips for approval">
          <Muted>• Plain background{"\n"}• Daylight or a bright room{"\n"}• Whole face visible, eyes open</Muted>
        </Card>
      </>
    ),
  },
  {
    key: "certificates",
    title: "Upload certificates",
    subtitle: "Trade certificates speed up verification.",
    valid: () => true,
    render: ({ data, pick }) => (
      <>
        <UploadCard title="Trade certificate" description="PDF or image, optional but recommended" glyph="🎓" value={data.certificates} onPick={() => pick("certificates", "certificate.pdf")} />
        <Muted>You can add more certificates later from Profile → Documents.</Muted>
      </>
    ),
  },
  {
    key: "license",
    title: "Upload trade license",
    subtitle: "Required for electrical, gas and pest control work.",
    valid: () => true,
    render: ({ data, pick }) => (
      <UploadCard title="Trade licence" description="Must be valid for at least 3 more months" glyph="📜" value={data.tradeLicense} onPick={() => pick("tradeLicense", "trade-licence.pdf")} />
    ),
  },
  {
    key: "emergency",
    title: "Emergency contact",
    subtitle: "Someone we can reach if something happens on a job.",
    valid: (d) => !!d.emergencyName && d.emergencyPhone.replace(/\D/g, "").length >= 10,
    render: ({ data, set }) => (
      <>
        <Input label="Full name" required value={data.emergencyName} onChangeText={(v) => set({ emergencyName: v })} placeholder="Contact name" />
        <Input label="Relationship" value={data.emergencyRelation} onChangeText={(v) => set({ emergencyRelation: v })} placeholder="Brother, spouse, friend…" />
        <Input label="Mobile number" required keyboardType="phone-pad" value={data.emergencyPhone} onChangeText={(v) => set({ emergencyPhone: v })} placeholder="+92 300 1234567" />
      </>
    ),
  },
  {
    key: "bank",
    title: "Bank details",
    subtitle: "Where your weekly payouts land. Encrypted at rest.",
    valid: (d) => !!d.bankName && !!d.accountTitle && d.accountNumber.length >= 8,
    render: ({ data, set }) => (
      <>
        <Select label="Bank or wallet" required value={data.bankName} onChange={(v) => set({ bankName: v })} options={BANKS.map((b) => ({ label: b, value: b }))} />
        <Input label="Account title" required value={data.accountTitle} onChangeText={(v) => set({ accountTitle: v })} placeholder="As printed on the account" />
        <Input label="Account number / IBAN" required autoCapitalize="characters" value={data.accountNumber} onChangeText={(v) => set({ accountNumber: v })} placeholder="PK00 XXXX 0000 0000 0000" />
      </>
    ),
  },
  {
    key: "review",
    title: "Review & submit",
    subtitle: "Check everything before it goes to the verification team.",
    valid: (d) => d.acceptedTerms,
    render: ({ data, set }) => (
      <>
        <Card title="Personal">
          <Row label="Name" value={`${data.firstName} ${data.lastName}`} />
          <Row label="CNIC" value={data.cnic} />
          <Row label="Date of birth" value={data.dateOfBirth} />
        </Card>
        <Card title="Contact">
          <Row label="Mobile" value={data.phone} />
          <Row label="Email" value={data.email} />
          <Row label="Address" value={data.address} />
        </Card>
        <Card title="Professional">
          <Row label="Headline" value={data.headline} />
          <Row label="Categories" value={data.categories.map((c) => SERVICE_CATEGORIES.find((s) => s.id === c)?.label ?? c).join(", ")} />
          <Row label="Experience" value={EXPERIENCE_LEVELS.find((e) => e.value === data.experienceLevel)?.label} />
          <Row label="Languages" value={data.languages.join(", ")} />
        </Card>
        <Card title="Coverage">
          <Row label="City" value={data.city} />
          <Row label="Areas" value={data.areas.join(", ")} />
          <Row label="Radius" value={`${data.radiusKm} km`} />
        </Card>
        <Card title="Documents">
          <Row label="CNIC front" value={data.cnicFront?.name} />
          <Row label="CNIC back" value={data.cnicBack?.name} />
          <Row label="Selfie" value={data.selfie?.name} />
          <Row label="Certificate" value={data.certificates?.name} />
          <Row label="Trade licence" value={data.tradeLicense?.name} />
        </Card>
        <Card title="Payout">
          <Row label="Bank" value={data.bankName} />
          <Row label="Account title" value={data.accountTitle} />
          <Row label="Account" value={data.accountNumber} />
        </Card>
        <Chip
          label={`${data.acceptedTerms ? "☑" : "☐"}  I confirm the information is accurate`}
          selected={data.acceptedTerms}
          onPress={() => set({ acceptedTerms: !data.acceptedTerms })}
        />
      </>
    ),
  },
];
