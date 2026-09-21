<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from "@internationalized/date";
import {
  invoiceSchema,
  parseDecimal,
  type InvoiceFormData,
  type InvoiceFormState,
} from "@/schemas/invoice";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
}>();

type SelectOption = {
  label: string;
  value: string;
};

type CatalogItem = {
  id: string;
  label: string;
  unit: string;
  price: number;
};

const vatStatus = ref(false);

const clients: SelectOption[] = [
  { label: "Prvi klijent DOO", value: "client_1" },
  { label: "Marko Marković", value: "client_2" },
];

const catalogItems: CatalogItem[] = [
  { id: "item_1", label: "Krečenje", unit: "usluga", price: 3000 },
  { id: "item_2", label: "Stolica", unit: "kom", price: 4500 },
];

const itemOptions = computed<SelectOption[]>(() =>
  catalogItems.map((item) => ({
    label: `${item.label} (${item.unit})`,
    value: item.id,
  })),
);

const taxRateOptions: SelectOption[] = [
  { label: "Bez PDV-a", value: "0" },
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
];

const currentDate = today(getLocalTimeZone());

const inputDate = useTemplateRef("inputDate");
const dueDateInput = useTemplateRef("dueDateInput");
const issueDatePopoverOpen = ref(false);
const dueDatePopoverOpen = ref(false);

const state = reactive<InvoiceFormState>({
  invoiceNumber: `001/${currentDate.year}`,
  issueDate: currentDate.toString(),
  dueDate: currentDate.add({ days: 7 }).toString(),
  clientId: clients[0]?.value ?? "",
  itemId: catalogItems[0]?.id ?? "",
  quantity: "1",
  price: String(catalogItems[0]?.price ?? ""),
  taxRate: vatStatus.value ? "20" : "0",
  note: "",
});

const issueDateModel = computed<DateValue | undefined>({
  get: () => (state.issueDate ? parseDate(state.issueDate) : undefined),
  set: (value) => {
    if (value) {
      state.issueDate = value.toString();
    }
  },
});

const dueDateModel = computed<DateValue | undefined>({
  get: () => (state.dueDate ? parseDate(state.dueDate) : undefined),
  set: (value) => {
    if (value) {
      state.dueDate = value.toString();
    }
  },
});

const selectedClient = computed(() =>
  clients.find((client) => client.value === state.clientId),
);

const selectedItem = computed(() =>
  catalogItems.find((item) => item.id === state.itemId),
);

watch(
  () => state.itemId,
  () => {
    if (!selectedItem.value) {
      return;
    }

    state.price = String(selectedItem.value.price);
  },
);

const quantity = computed(() => parseDecimal(state.quantity || "0"));
const unitPrice = computed(() => parseDecimal(state.price || "0"));
const taxRate = computed(() => Number(state.taxRate));
const subtotal = computed(() => quantity.value * unitPrice.value);
const taxAmount = computed(() => (subtotal.value * taxRate.value) / 100);
const total = computed(() => subtotal.value + taxAmount.value);

function formatMoney(value: number) {
  return new Intl.NumberFormat("sr-Latn-RS", {
    style: "currency",
    currency: "RSD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

const submitAttempted = ref(false);

async function onSubmit(event: FormSubmitEvent<InvoiceFormData>) {
  submitAttempted.value = true;

  toast.add({
    title: props.onboarding
      ? "Vaša prva faktura je spremna."
      : "Faktura je sačuvana.",
    color: "success",
    duration: 2000,
  });

  console.log("Invoice data", {
    ...event.data,
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    total: total.value,
  });
}

async function onError(event: FormErrorEvent) {
  console.log("Submit errors", event.errors);
  submitAttempted.value = true;
}
</script>

<template>
  <UPageCard class="w-full max-w-md mx-auto">
    <UForm
      :schema="invoiceSchema"
      :state="state"
      class="space-y-4"
      :validate-on-input-delay="0"
      novalidate
      @submit="onSubmit"
      @error="onError"
    >
      <div
        v-if="!props.onboarding"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <UFormField
          label="Broj fakture"
          name="invoiceNumber"
          eager-validation
          required
        >
          <UInput
            v-model="state.invoiceNumber"
            class="w-full"
            placeholder="001/2026"
          />
        </UFormField>

        <UFormField
          label="Datum izdavanja"
          name="issueDate"
          eager-validation
          required
        >
          <UInputDate
            ref="inputDate"
            v-model="issueDateModel"
            :range="false"
            locale="sr-Latn-RS"
            readonly
            class="w-full [&>div]:w-auto!"
          >
            <template #trailing>
              <UPopover
                v-model:open="issueDatePopoverOpen"
                :reference="inputDate?.inputsRef[3]?.$el"
                :content="{
                  align: 'start',
                  side: 'bottom',
                }"
              >
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Izaberi datum izdavanja"
                  class="px-0"
                />

                <template #content>
                  <LazyUCalendar
                    v-model="issueDateModel"
                    :range="false"
                    :multiple="false"
                    prevent-deselect
                    class="p-2"
                    @update:model-value="issueDatePopoverOpen = false"
                  />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>
      </div>

      <UFormField
        label="Rok plaćanja"
        name="dueDate"
        :eager-validation="submitAttempted"
        required
      >
        <UInputDate
          ref="dueDateInput"
          v-model="dueDateModel"
          :range="false"
          :min-value="issueDateModel"
          locale="sr-Latn-RS"
          readonly
          class="w-full [&>div]:w-auto!"
        >
          <template #trailing>
            <UPopover
              v-model:open="dueDatePopoverOpen"
              :reference="dueDateInput?.inputsRef[3]?.$el"
              :content="{
                align: 'start',
                side: 'bottom',
              }"
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Izaberi rok plaćanja"
                class="px-0"
              />

              <template #content>
                <LazyUCalendar
                  v-model="dueDateModel"
                  :range="false"
                  :multiple="false"
                  :min-value="issueDateModel"
                  prevent-deselect
                  class="p-2"
                  @update:model-value="dueDatePopoverOpen = false"
                />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>

      <UFormField label="Klijent" name="clientId" eager-validation required>
        <USelect v-model="state.clientId" :items="clients" class="w-full" />
      </UFormField>

      <UFormField
        label="Proizvod ili usluga"
        name="itemId"
        eager-validation
        required
      >
        <USelect v-model="state.itemId" :items="itemOptions" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Količina" name="quantity" eager-validation required>
          <UInput
            v-model="state.quantity"
            class="w-full"
            inputmode="decimal"
            placeholder="1"
          />
        </UFormField>

        <UFormField label="Cena" name="price" eager-validation required>
          <UInput
            v-model="state.price"
            class="w-full"
            inputmode="decimal"
            placeholder="3000"
          />
        </UFormField>
      </div>

      <UFormField
        v-if="!props.onboarding"
        label="PDV"
        name="taxRate"
        eager-validation
        required
      >
        <USelect
          v-model="state.taxRate"
          :items="taxRateOptions"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Napomena" name="note" eager-validation>
        <UTextarea
          v-model="state.note"
          class="w-full"
          autoresize
          placeholder="Rok plaćanja, instrukcije ili dodatna napomena"
        />
      </UFormField>

      <div class="rounded-md border border-default bg-muted/40 p-4 space-y-2">
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">Klijent</span>
          <span class="text-sm text-highlighted text-right">
            {{ selectedClient?.label || "Nije izabran" }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">Stavka</span>
          <span class="text-sm text-highlighted text-right">
            {{ selectedItem?.label || "Nije izabrana" }}
          </span>
        </div>

        <USeparator />

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">Osnovica</span>
          <span class="text-sm text-highlighted">{{
            formatMoney(subtotal)
          }}</span>
        </div>

        <div
          v-if="!props.onboarding"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-sm text-muted">PDV</span>
          <span class="text-sm text-highlighted">{{
            formatMoney(taxAmount)
          }}</span>
        </div>

        <div class="flex items-center justify-between gap-4 pt-1">
          <span class="font-medium">Ukupno</span>
          <span class="font-medium text-highlighted">{{
            formatMoney(total)
          }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-eye"
          class="justify-center"
        >
          Pregled PDF-a
        </UButton>

        <UButton type="submit" icon="i-lucide-save" class="justify-center">
          Sačuvaj fakturu
        </UButton>
      </div>
    </UForm>
  </UPageCard>
</template>
