import * as z from "zod";

export const vatStatuses = ["vatOn", "vatOff"] as const;
export const companyTypes = ["doo", "pr", "other"] as const;

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ime firme je obavezan")
    .max(150, "Ime može sadržati maksimalno 150 karaktera"),
  shortName: z
    .string()
    .trim()
    .max(50, "Skraćeno ime može sadržati maksimalno 50 karaktera")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(50, "Adresa može sadržati maksimalno 50 karaktera")
    .min(1, "Adresa firme je obavezna"),
  place: z
    .string()
    .trim()
    .max(20, "Grad/mesto može sadržati maksimalno 20 karaktera")
    .min(1, "Grad/mesto firme je obavezno"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Poštanski broj je obavezan")
    .regex(/^\d{5}$/, "Poštanski broj mora imati tačno 5 cifara"),
  email: z
    .email("Ispravan email je obavezan")
    .max(50, "Email može sadržati maksimalno 50 karaktera")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(15, "Broj telefona može sadržati maksimalno 15 karaktera")
    .optional()
    .or(z.literal("")),
  pib: z
    .string()
    .trim()
    .min(1, "PIB firme je obavezan")
    .regex(/^\d{9}$/, "PIB mora imati tačno 9 cifara"),
  vatStatus: z.enum(vatStatuses),
  companyType: z.enum(companyTypes).optional(),
  bankAccount: z
    .string()
    .trim()
    .min(1, "Broj računa je obavezan")
    .regex(/^\d{3}-\d{1,13}-\d{2}$/, "Broj računa nije u ispravnom formatu"),
  mb: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Matični broj mora imati tačno 8 cifara")
    .optional()
    .or(z.literal("")),
});

export type VatStatus = (typeof vatStatuses)[number];
export type CompanyType = (typeof companyTypes)[number];
export type CompanyFormState = z.input<typeof companySchema>;
export type CompanyFormData = z.output<typeof companySchema>;
