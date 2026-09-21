<script setup lang="ts">
import { useInvoicesStore } from "@/stores/invoices";

const route = useRoute();
const invoicesStore = useInvoicesStore();

const invoiceId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id,
);
const invoice = computed(() =>
  invoiceId.value
    ? invoicesStore.getInvoiceById(String(invoiceId.value))
    : undefined,
);
const invoiceNotes = computed(() =>
  [invoice.value?.vatNote, invoice.value?.note].filter(Boolean).join("\n"),
);

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
  <div class="mx-auto w-full max-w-5xl text-left">
    <div v-if="invoice">
      <div class="mb-5 flex items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Nazad na fakture"
            to="/invoices"
          />
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl! font-semibold!">
                Faktura {{ invoice.invoiceNumber }}
              </h1>
              <UBadge label="Nacrt" color="neutral" variant="subtle" />
            </div>
            <p class="mt-1 truncate text-sm! text-muted">
              {{ invoice.client.shortName || invoice.client.name }}
            </p>
          </div>
        </div>

        <UButton
          label="Pregled PDF-a"
          icon="i-lucide-eye"
          color="neutral"
          variant="soft"
          disabled
          class="shrink-0"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 border-y border-default py-5 md:grid-cols-2">
        <section>
          <h2 class="mb-3 text-sm! font-medium! text-muted">Izdavalac</h2>
          <p class="font-medium text-highlighted">{{ invoice.seller.name }}</p>
          <p class="mt-1 text-sm text-toned">
            {{ invoice.seller.address }}, {{ invoice.seller.postalCode }}
            {{ invoice.seller.place }}
          </p>
          <p class="mt-1 text-sm text-toned">PIB: {{ invoice.seller.pib }}</p>
        </section>

        <section>
          <h2 class="mb-3 text-sm! font-medium! text-muted">Primalac</h2>
          <p class="font-medium text-highlighted">{{ invoice.client.name }}</p>
          <p class="mt-1 text-sm text-toned">
            {{ invoice.client.address }}, {{ invoice.client.postalCode }}
            {{ invoice.client.place }}
          </p>
          <p v-if="invoice.client.pib" class="mt-1 text-sm text-toned">
            PIB: {{ invoice.client.pib }}
          </p>
        </section>
      </div>

      <dl class="grid grid-cols-2 gap-4 py-5 sm:grid-cols-4">
        <div>
          <dt class="text-xs text-muted">Datum izdavanja</dt>
          <dd class="mt-1 text-sm text-highlighted">
            {{ formatDate(invoice.issueDate) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Datum prometa</dt>
          <dd class="mt-1 text-sm text-highlighted">
            {{ formatDate(invoice.supplyDate) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Rok plaćanja</dt>
          <dd class="mt-1 text-sm text-highlighted">
            {{ formatDate(invoice.dueDate) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Mesto izdavanja</dt>
          <dd class="mt-1 text-sm text-highlighted">
            {{ invoice.placeOfIssue }}
          </dd>
        </div>
      </dl>

      <div class="overflow-x-auto border-y border-default">
        <table class="w-full min-w-180 text-sm">
          <thead class="bg-muted/40 text-left text-xs text-muted">
            <tr>
              <th class="px-3 py-3 font-medium">Stavka</th>
              <th class="px-3 py-3 text-right font-medium">Količina</th>
              <th class="px-3 py-3 text-right font-medium">Cena</th>
              <th class="px-3 py-3 text-right font-medium">PDV</th>
              <th class="px-3 py-3 text-right font-medium">Ukupno</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="(item, index) in invoice.items"
              :key="`${item.itemId}-${index}`"
            >
              <td class="px-3 py-3">
                <p class="font-medium text-highlighted">{{ item.name }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ item.unit }}</p>
              </td>
              <td class="px-3 py-3 text-right">{{ item.quantity }}</td>
              <td class="px-3 py-3 text-right">
                {{ formatMoney(item.price) }}
              </td>
              <td class="px-3 py-3 text-right">{{ item.taxRate }}%</td>
              <td class="px-3 py-3 text-right font-medium">
                {{ formatMoney(item.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ml-auto mt-5 w-full max-w-sm space-y-2">
        <div class="flex justify-between gap-4 text-sm">
          <span class="text-muted">Osnovica</span>
          <span>{{ formatMoney(invoice.subtotal) }}</span>
        </div>
        <div class="flex justify-between gap-4 text-sm">
          <span class="text-muted">PDV</span>
          <span>{{ formatMoney(invoice.taxAmount) }}</span>
        </div>
        <USeparator />
        <div class="flex justify-between gap-4 font-semibold">
          <span>Ukupno</span>
          <span>{{ formatMoney(invoice.total) }}</span>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-5 border-t border-default pt-5 sm:grid-cols-2">
        <div>
          <p class="text-xs text-muted">Račun za uplatu</p>
          <p class="mt-1 break-all text-sm text-highlighted">
            {{ invoice.paymentAccount }}
          </p>
          <p class="mt-1 text-xs text-muted">Valuta: {{ invoice.currency }}</p>
        </div>
        <div v-if="invoiceNotes">
          <p class="text-xs text-muted">Napomena</p>
          <p class="mt-1 whitespace-pre-wrap text-sm text-toned">
            {{ invoiceNotes }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center py-16 text-center">
      <UIcon name="i-lucide-file-x-2" class="mb-3 size-9 text-muted" />
      <h1 class="text-lg! font-medium!">Faktura nije pronađena</h1>
      <p class="mt-1 text-sm! text-muted">
        Mock podaci se trenutno brišu nakon osvežavanja stranice.
      </p>
      <UButton label="Nazad na fakture" class="mt-4" to="/invoices" />
    </div>
  </div>
</template>
