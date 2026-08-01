import type { UploadValue } from "@/components";

export type RegistrationData = {
  // Personal
  firstName: string;
  lastName: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
  // Contact
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  // Professional
  headline: string;
  bio: string;
  languages: string[];
  // Categories & experience
  categories: string[];
  experienceLevel: string;
  lastEmployer: string;
  // Coverage
  city: string;
  areas: string[];
  radiusKm: number;
  // Documents
  cnicFront: UploadValue | null;
  cnicBack: UploadValue | null;
  selfie: UploadValue | null;
  certificates: UploadValue | null;
  tradeLicense: UploadValue | null;
  // Emergency contact
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  // Bank
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  // Consent
  acceptedTerms: boolean;
};

export const EMPTY_REGISTRATION: RegistrationData = {
  firstName: "",
  lastName: "",
  cnic: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  headline: "",
  bio: "",
  languages: [],
  categories: [],
  experienceLevel: "",
  lastEmployer: "",
  city: "",
  areas: [],
  radiusKm: 10,
  cnicFront: null,
  cnicBack: null,
  selfie: null,
  certificates: null,
  tradeLicense: null,
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  acceptedTerms: false,
};
