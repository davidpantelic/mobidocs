<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useInvoicesStore } from "@/stores/invoices";

const invoicesStore = useInvoicesStore();
const { invoices } = storeToRefs(invoicesStore);

function formatMoney(value: number) {
  return new Intl.NumberFormat("sr-Latn-RS", {
    style: "currency",
    currency: "RSD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sr-Latn-RS").format(
    new Date(`${value}T00:00:00`),
  );
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <UiPageHeader title="Dokumenti" icon="i-lucide-file" />

    <div v-if="!!invoices.length" class="mb-4 flex justify-end">
      <UButton label="Nova faktura" icon="i-lucide-plus" to="/invoices/new" />
    </div>

    <div v-if="invoices.length" class="grid grid-cols-1 gap-3">
      <UPageCard
        v-for="invoice in invoices"
        :key="invoice.id"
        :to="`/invoices/${invoice.id}`"
        variant="subtle"
        class="text-left"
        :ui="{ container: 'gap-3 p-4' }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base! font-medium! text-highlighted">
                Faktura {{ invoice.invoiceNumber }}
              </h2>
              <UBadge label="Nacrt" color="neutral" variant="subtle" />
            </div>
            <p class="mt-1 truncate text-sm! text-muted">
              {{ invoice.client.shortName || invoice.client.name }}
            </p>
          </div>

          <span class="shrink-0 font-medium text-highlighted">
            {{ formatMoney(invoice.total) }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-4 text-xs text-muted">
          <span>Izdata {{ formatDate(invoice.issueDate) }}</span>
          <span>Dospelost {{ formatDate(invoice.dueDate) }}</span>
        </div>
      </UPageCard>
    </div>

    <div v-else class="flex flex-col items-center py-16 text-center">
      <UIcon name="i-lucide-file-plus-2" class="mb-3 size-9 text-muted" />
      <h2 class="text-base! font-medium!">Još nemate nijednu fakturu</h2>
      <p class="mt-1 text-sm! text-muted">
        Napravite prvu fakturu za jednog od svojih klijenata.
      </p>
      <UButton
        label="Kreiraj fakturu"
        icon="i-lucide-plus"
        class="mt-4"
        to="/invoices/new"
      />
    </div>
  </div>
</template>
