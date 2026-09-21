import * as z from "zod";

export const clientTypes = ["company", "person"] as const;

export const clientSchema = z
  .object({
    type: z.enum(clientTypes),
    name: z
      .string()
      .trim()
      .min(1, "Ime klijenta je obavezno")
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
      .min(1, "Adresa klijenta je obavezna")
      .max(50, "Adresa može sadržati maksimalno 50 karaktera"),
    place: z
      .string()
      .trim()
      .min(1, "Grad/mesto klijenta je obavezno")
      .max(20, "Grad/mesto može sadržati maksimalno 20 karaktera"),
    email: z
      .email("Ispravan email je obavezan")
      .max(50, "Email može sadržati maksimalno 50 karaktera")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(25, "Broj telefona može sadržati maksimalno 25 karaktera")
      .optional()
      .or(z.literal("")),
    pib: z.string().trim().optional().or(z.literal("")),
    bankAccount: z
      .string()
      .trim()
      .regex(/^\d{3}-\d{1,13}-\d{2}$/, "Broj računa nije u ispravnom formatu")
      .optional()
      .or(z.literal("")),
    mb: z
      .string()
      .trim()
      .regex(/^\d{8}$/, "Matični broj mora imati tačno 8 cifara")
      .optional()
      .or(z.literal("")),
    contactPerson: z
      .string()
      .trim()
      .max(50, "Ime kontakt osobe može sadržati maksimalno 50 karaktera")
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .trim()
      .max(300, "Napomena može sadržati maksimalno 300 karaktera")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "company") {
      if (!data.pib) {
        ctx.addIssue({
          code: "custom",
          path: ["pib"],
          message: "PIB firme klijenta je obavezan",
        });

        return;
      }
      if (!/^\d{9}$/.test(data.pib)) {
        ctx.addIssue({
          code: "custom",
          path: ["pib"],
          message: "PIB mora imati tačno 9 cifara",
        });
      }
    }
  });

export type ClientType = (typeof clientTypes)[number];
export type ClientFormState = z.input<typeof clientSchema>;
export type ClientFormData = z.output<typeof clientSchema>;
