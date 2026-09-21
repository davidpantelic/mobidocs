<script setup lang="ts">
import type { InvoiceFormData } from "@/schemas/invoice";
import { useClientsStore } from "@/stores/clients";
import { useCatalogItemsStore } from "@/stores/catalogItems";
import { useInvoicesStore } from "@/stores/invoices";

const route = useRoute();
const clientsStore = useClientsStore();
const catalogItemsStore = useCatalogItemsStore();
const invoicesStore = useInvoicesStore();
const toast = useToast();

const requestedClientId = computed(() => {
  const clientId = route.query.clientId;
  return typeof clientId === "string" ? clientId : undefined;
});

const initialClientId = computed(() =>
  requestedClientId.value &&
  clientsStore.getClientById(requestedClientId.value)
    ? requestedClientId.value
    : undefined,
);

const initialClient = computed(() =>
  initialClientId.value
    ? clientsStore.getClientById(initialClientId.value)
    : undefined,
);

const requestedItemId = computed(() => {
  const itemId = route.query.itemId;
  return typeof itemId === "string" ? itemId : undefined;
});

const initialItemId = computed(() =>
  requestedItemId.value &&
  catalogItemsStore.getCatalogItemById(requestedItemId.value)
    ? requestedItemId.value
    : undefined,
);

const initialItem = computed(() =>
  initialItemId.value
    ? catalogItemsStore.getCatalogItemById(initialItemId.value)
    : undefined,
);

async function saveInvoice(data: InvoiceFormData) {
  try {
    const invoice = invoicesStore.addInvoice(data);
    await navigateTo(`/invoices/${invoice.id}`);
  } catch (error) {
    toast.add({
      title: "Faktura nije sačuvana.",
      description:
        error instanceof Error ? error.message : "Pokušajte ponovo.",
      color: "error",
      duration: 3000,
    });
  }
}
</script>

<template>
  <div class="w-full">
    <div class="mx-auto mb-5 flex w-full max-w-2xl items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        aria-label="Nazad na fakture"
        to="/invoices"
      />
      <div class="min-w-0">
        <h1 class="text-xl! font-semibold!">Nova faktura</h1>
        <p v-if="initialClient" class="truncate text-sm! text-muted">
          Za klijenta {{ initialClient.shortName || initialClient.name }}
        </p>
        <p v-if="initialItem" class="truncate text-sm! text-muted">
          Sa stavkom {{ initialItem.name }}
        </p>
      </div>
    </div>

    <LazyInvoiceForm
      :key="`${initialClientId ?? 'client'}-${initialItemId ?? 'item'}`"
      :onboarding="false"
      :initial-client-id="initialClientId"
      :initial-item-id="initialItemId"
      :initial-invoice-number="invoicesStore.getNextInvoiceNumber()"
      @saved="saveInvoice"
    />
  </div>
</template>
