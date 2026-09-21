import * as z from "zod";

export const taxRates = ["0", "10", "20"] as const;

export function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

export const invoiceItemSchema = z.object({
  itemId: z.string().min(1, "Proizvod ili usluga su obavezni"),
  quantity: z
    .string()
    .trim()
    .min(1, "Količina je obavezna")
    .regex(/^\d+([,.]\d{1,2})?$/, "Količina mora biti broj, npr. 1 ili 1,50")
    .transform(parseDecimal)
    .pipe(z.number().positive("Količina mora biti veća od 0")),
  price: z
    .string()
    .trim()
    .min(1, "Cena je obavezna")
    .regex(
      /^\d+([,.]\d{1,2})?$/,
      "Cena mora biti broj, npr. 3000 ili 3000,50",
    )
    .transform(parseDecimal)
    .pipe(z.number().positive("Cena mora biti veća od 0")),
  taxRate: z.enum(taxRates).transform(Number),
});

export const invoiceSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1, "Broj fakture je obavezan")
      .max(30, "Broj fakture može sadržati maksimalno 30 karaktera"),
    issueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum izdavanja je obavezan"),
    supplyDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum prometa je obavezan"),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Rok plaćanja je obavezan"),
    clientId: z.string().min(1, "Klijent je obavezan"),
    items: z
      .array(invoiceItemSchema)
      .min(1, "Faktura mora imati najmanje jednu stavku"),
    note: z
      .string()
      .trim()
      .max(300, "Napomena može sadržati maksimalno 300 karaktera")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.dueDate) < new Date(data.issueDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Rok plaćanja ne može biti pre datuma izdavanja",
      });
    }
  });

export type TaxRate = (typeof taxRates)[number];
export type InvoiceItemFormState = z.input<typeof invoiceItemSchema>;
export type InvoiceItemFormData = z.output<typeof invoiceItemSchema>;
export type InvoiceFormState = z.input<typeof invoiceSchema>;
export type InvoiceFormData = z.output<typeof invoiceSchema>;
