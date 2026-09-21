import * as z from "zod";

export const catalogItemTypes = ["service", "product"] as const;

export const unitValues = [
  "usluga",
  "sat",
  "dan",
  "mesec",
  "pausal",
  "kom",
  "kg",
  "l",
  "m",
  "paket",
] as const;

export const catalogItemSchema = z.object({
  type: z.enum(catalogItemTypes),
  name: z
    .string()
    .trim()
    .min(1, "Naziv je obavezan")
    .max(100, "Naziv može sadržati maksimalno 100 karaktera"),
  description: z
    .string()
    .trim()
    .max(300, "Opis može sadržati maksimalno 300 karaktera")
    .optional(),
  unit: z.enum(unitValues, "Jedinica mere je obavezna"),
  price: z
    .string()
    .trim()
    .min(1, "Cena je obavezna")
    .regex(/^\d+([,.]\d{1,2})?$/, "Cena mora biti broj, npr. 3000 ili 3000,50")
    .transform((value) => Number(value.replace(",", ".")))
    .pipe(
      z
        .number()
        .positive("Cena mora biti veća od 0")
        .max(999999999, "Cena je prevelika"),
    ),
});

export type CatalogItemType = (typeof catalogItemTypes)[number];
export type UnitValue = (typeof unitValues)[number];
export type CatalogItemFormState = z.input<typeof catalogItemSchema>;
export type CatalogItemFormData = z.output<typeof catalogItemSchema>;
