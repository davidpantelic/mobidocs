import { defineStore } from "pinia";
import type { InvoiceFormData } from "@/schemas/invoice";
import type { UnitValue } from "@/schemas/catalog-item";
import type { Company } from "@/stores/company";
import type { Client } from "@/stores/clients";
import { useCompanyStore } from "@/stores/company";
import { useClientsStore } from "@/stores/clients";
import { useCatalogItemsStore } from "@/stores/catalogItems";

type InvoiceItemData = InvoiceFormData["items"][number];

export type InvoiceLine = InvoiceItemData & {
  name: string;
  description?: string;
  unit: UnitValue;
  subtotal: number;
  taxAmount: number;
  total: number;
};

export type Invoice = Omit<InvoiceFormData, "items"> & {
  id: string;
  status: "draft";
  currency: "RSD";
  placeOfIssue: string;
  paymentAccount: string;
  vatNote?: string;
  seller: Company;
  client: Client;
  items: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const useInvoicesStore = defineStore("invoices", () => {
  const companyStore = useCompanyStore();
  const clientsStore = useClientsStore();
  const catalogItemsStore = useCatalogItemsStore();
  const invoices = ref<Invoice[]>([]);

  function getNextInvoiceNumber() {
    const year = new Date().getFullYear();
    const sequence = String(invoices.value.length + 1).padStart(3, "0");

    return `${sequence}/${year}`;
  }

  function addInvoice(data: InvoiceFormData) {
    const client = clientsStore.getClientById(data.clientId);

    if (!client) {
      throw new Error("Izabrani klijent ne postoji.");
    }

    const items: InvoiceLine[] = data.items.map((item) => {
      const catalogItem = catalogItemsStore.getCatalogItemById(item.itemId);

      if (!catalogItem) {
        throw new Error("Izabrani proizvod ili usluga ne postoji.");
      }

      const subtotal = roundMoney(item.quantity * item.price);
      const taxAmount = roundMoney((subtotal * item.taxRate) / 100);

      return {
        ...item,
        name: catalogItem.name,
        description: catalogItem.description,
        unit: catalogItem.unit,
        subtotal,
        taxAmount,
        total: roundMoney(subtotal + taxAmount),
      };
    });

    const subtotal = roundMoney(
      items.reduce((sum, item) => sum + item.subtotal, 0),
    );
    const taxAmount = roundMoney(
      items.reduce((sum, item) => sum + item.taxAmount, 0),
    );
    const invoice: Invoice = {
      ...data,
      id: `invoice_${Date.now()}`,
      status: "draft",
      currency: "RSD",
      placeOfIssue: companyStore.company.place,
      paymentAccount: companyStore.company.bankAccount,
      vatNote:
        companyStore.company.vatStatus === "vatOff"
          ? "PDV nije obračunat jer izdavalac nije u sistemu PDV-a."
          : undefined,
      seller: { ...companyStore.company },
      client: { ...client },
      items,
      subtotal,
      taxAmount,
      total: roundMoney(subtotal + taxAmount),
      createdAt: new Date().toISOString(),
    };

    invoices.value.push(invoice);
    return invoice;
  }

  function getInvoiceById(id: string) {
    return invoices.value.find((invoice) => invoice.id === id);
  }

  return { invoices, getNextInvoiceNumber, addInvoice, getInvoiceById };
});
