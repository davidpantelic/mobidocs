<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import { storeToRefs } from "pinia";
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
  type InvoiceItemFormState,
  type InvoiceFormState,
} from "@/schemas/invoice";
import type { VatStatus } from "@/schemas/company";
import { useClientsStore } from "@/stores/clients";
import { useCatalogItemsStore } from "@/stores/catalogItems";
import { useCompanyStore } from "@/stores/company";

const toast = useToast();
const clientsStore = useClientsStore();
const catalogItemsStore = useCatalogItemsStore();
const companyStore = useCompanyStore();
const { clients } = storeToRefs(clientsStore);
const { catalogItems } = storeToRefs(catalogItemsStore);
const props = defineProps<{
  onboarding: boolean;
  vatStatus?: VatStatus;
  initialClientId?: string;
  initialItemId?: string;
  initialInvoiceNumber?: string;
}>();

const emit = defineEmits<{
  saved: [invoice: InvoiceFormData];
}>();

type SelectOption = {
  label: string;
  value: string;
};

const clientOptions = computed<SelectOption[]>(() =>
  clients.value.map((client) => ({
    label: client.shortName || client.name,
    value: client.id,
  })),
);

const itemOptions = computed<SelectOption[]>(() =>
  catalogItems.value.map((item) => ({
    label: `${item.name} (${item.unit})`,
    value: item.id,
  })),
);

const taxRateOptions: SelectOption[] = [
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
];

const currentDate = today(getLocalTimeZone());

const inputDate = useTemplateRef("inputDate");
const supplyDateInput = useTemplateRef("supplyDateInput");
const dueDateInput = useTemplateRef("dueDateInput");
const issueDatePopoverOpen = ref(false);
const supplyDatePopoverOpen = ref(false);
const dueDatePopoverOpen = ref(false);

const isVatRegistered = computed(
  () => (props.vatStatus ?? companyStore.company.vatStatus) === "vatOn",
);

const initialClientId = clientsStore.getClientById(props.initialClientId ?? "")
  ? props.initialClientId
  : clients.value[0]?.id;

const initialItemId = catalogItemsStore.getCatalogItemById(
  props.initialItemId ?? "",
)
  ? props.initialItemId
  : catalogItems.value[0]?.id;

function createInvoiceItem(itemId = catalogItems.value[0]?.id ?? ""): InvoiceItemFormState {
  const catalogItem = catalogItemsStore.getCatalogItemById(itemId);

  return {
    itemId: catalogItem?.id ?? "",
    quantity: "1",
    price: String(catalogItem?.price ?? ""),
    taxRate: isVatRegistered.value ? "20" : "0",
  };
}

const state = reactive<InvoiceFormState>({
  invoiceNumber:
    props.initialInvoiceNumber ?? `001/${currentDate.year}`,
  issueDate: currentDate.toString(),
  supplyDate: currentDate.toString(),
  dueDate: currentDate.add({ days: 7 }).toString(),
  clientId: initialClientId ?? "",
  items: [createInvoiceItem(initialItemId)],
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

const supplyDateModel = computed<DateValue | undefined>({
  get: () => (state.supplyDate ? parseDate(state.supplyDate) : undefined),
  set: (value) => {
    if (value) {
      state.supplyDate = value.toString();
    }
  },
});

const selectedClient = computed(() =>
  clients.value.find((client) => client.id === state.clientId),
);

function getCatalogItem(itemId: string) {
  return catalogItems.value.find((item) => item.id === itemId);
}

function parseAmount(value: string) {
  const amount = parseDecimal(value || "0");
  return Number.isFinite(amount) ? amount : 0;
}

function getItemSubtotal(item: InvoiceItemFormState) {
  return parseAmount(item.quantity) * parseAmount(item.price);
}

function getItemTax(item: InvoiceItemFormState) {
  return (getItemSubtotal(item) * Number(item.taxRate)) / 100;
}

function updateItemPrice(index: number, itemId: string) {
  const catalogItem = getCatalogItem(itemId);
  const invoiceItem = state.items[index];

  if (catalogItem && invoiceItem) {
    invoiceItem.price = String(catalogItem.price);
  }
}

function addItem() {
  state.items.push(createInvoiceItem());
}

function removeItem(index: number) {
  if (state.items.length > 1) {
    state.items.splice(index, 1);
  }
}

watch(isVatRegistered, (registered) => {
  for (const item of state.items) {
    item.taxRate = registered ? "20" : "0";
  }
});

const subtotal = computed(() =>
  state.items.reduce((sum, item) => sum + getItemSubtotal(item), 0),
);
const taxAmount = computed(() =>
  state.items.reduce((sum, item) => sum + getItemTax(item), 0),
);
const total = computed(() => subtotal.value + taxAmount.value);
const vatNote = computed(() =>
  isVatRegistered.value
    ? ""
    : "PDV nije obračunat jer izdavalac nije u sistemu PDV-a.",
);

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
  emit("saved", event.data);

  toast.add({
    title: props.onboarding
      ? "Vaša prva faktura je spremna."
      : "Faktura je sačuvana.",
    color: "success",
    duration: 2000,
  });

  console.log("Invoice data", {
    ...event.data,
    vatNote: vatNote.value || undefined,
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
  <UPageCard class="w-full max-w-2xl mx-auto">
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField
          label="Datum prometa"
          name="supplyDate"
          :eager-validation="submitAttempted"
          required
        >
          <UInputDate
            ref="supplyDateInput"
            v-model="supplyDateModel"
            :range="false"
            locale="sr-Latn-RS"
            readonly
            class="w-full [&>div]:w-auto!"
          >
            <template #trailing>
              <UPopover
                v-model:open="supplyDatePopoverOpen"
                :reference="supplyDateInput?.inputsRef[3]?.$el"
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
                  aria-label="Izaberi datum prometa"
                  class="px-0"
                />

                <template #content>
                  <LazyUCalendar
                    v-model="supplyDateModel"
                    :range="false"
                    :multiple="false"
                    prevent-deselect
                    class="p-2"
                    @update:model-value="supplyDatePopoverOpen = false"
                  />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>

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
      </div>

      <UFormField label="Klijent" name="clientId" eager-validation required>
        <USelect
          v-model="state.clientId"
          :items="clientOptions"
          class="w-full"
        />
      </UFormField>

      <div class="space-y-3">
        <h2 class="font-medium">Stavke fakture</h2>

        <div
          v-for="(item, index) in state.items"
          :key="index"
          class="rounded-md border border-default p-4 space-y-4"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium">Stavka {{ index + 1 }}</span>
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash-2"
              :class="
                state.items.length === 1
                  ? 'cursor-not-allowed!'
                  : 'cursor-pointer'
              "
              :disabled="state.items.length === 1"
              :aria-label="`Obriši stavku ${index + 1}`"
              @click="removeItem(index)"
            />
          </div>

          <UFormField
            label="Proizvod ili usluga"
            :name="`items.${index}.itemId`"
            eager-validation
            required
          >
            <USelect
              v-model="item.itemId"
              :items="itemOptions"
              class="w-full"
              @update:model-value="updateItemPrice(index, $event)"
            />
          </UFormField>

          <div
            class="grid grid-cols-1 gap-4"
            :class="isVatRegistered ? 'sm:grid-cols-3' : 'sm:grid-cols-2'"
          >
            <UFormField
              label="Količina"
              :name="`items.${index}.quantity`"
              eager-validation
              required
            >
              <UInput
                v-model="item.quantity"
                class="w-full"
                inputmode="decimal"
                placeholder="1"
              />
            </UFormField>

            <UFormField
              label="Cena"
              :name="`items.${index}.price`"
              eager-validation
              required
            >
              <UInput
                v-model="item.price"
                class="w-full"
                inputmode="decimal"
                placeholder="3000"
              />
            </UFormField>

            <UFormField
              v-if="isVatRegistered"
              label="PDV"
              :name="`items.${index}.taxRate`"
              eager-validation
              required
            >
              <USelect
                v-model="item.taxRate"
                :items="taxRateOptions"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="flex justify-end gap-4 text-sm">
            <span class="text-muted">Ukupno za stavku</span>
            <span class="font-medium text-highlighted">
              {{ formatMoney(getItemSubtotal(item) + getItemTax(item)) }}
            </span>
          </div>
        </div>

        <div class="flex justify-end">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-plus"
            @click="addItem"
          >
            Dodaj stavku
          </UButton>
        </div>

        <p v-if="!isVatRegistered" class="text-sm text-muted">
          {{ vatNote }}
        </p>
      </div>

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
            {{
              selectedClient?.shortName ||
              selectedClient?.name ||
              "Nije izabran"
            }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">Broj stavki</span>
          <span class="text-sm text-highlighted text-right">
            {{ state.items.length }}
          </span>
        </div>

        <USeparator />

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">Osnovica</span>
          <span class="text-sm text-highlighted">{{
            formatMoney(subtotal)
          }}</span>
        </div>

        <div class="flex items-center justify-between gap-4">
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
