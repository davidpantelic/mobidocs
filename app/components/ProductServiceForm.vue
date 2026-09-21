<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
  catalogItemSchema,
  type CatalogItemFormData,
  type CatalogItemFormState,
  type CatalogItemType,
} from "@/schemas/catalog-item";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
  item?: CatalogItemFormData;
}>();

const emit = defineEmits<{
  saved: [item: CatalogItemFormData];
}>();

type CatalogItemOption = {
  label: string;
  id: CatalogItemType;
};

const catalogItems: CatalogItemOption[] = [
  {
    label: "Usluga",
    id: "service",
  },
  {
    label: "Proizvod",
    id: "product",
  },
];

const unitOptions = computed(() => {
  if (state.type === "service") {
    return [
      { label: "Usluga", value: "usluga" },
      { label: "Sat", value: "sat" },
      { label: "Dan", value: "dan" },
      { label: "Mesec", value: "mesec" },
      { label: "Paušal", value: "pausal" },
    ];
  }

  return [
    { label: "Komad", value: "kom" },
    { label: "Kilogram", value: "kg" },
    { label: "Litar", value: "l" },
    { label: "Metar", value: "m" },
    { label: "Paket", value: "paket" },
  ];
});

const state = reactive<CatalogItemFormState>({
  type: props.item?.type ?? "service",
  name: props.item?.name ?? "",
  description: props.item?.description ?? "",
  unit: props.item?.unit ?? "usluga",
  price: props.item ? String(props.item.price) : "",
});

watch(
  () => state.type,
  (type) => {
    state.unit = type === "service" ? "usluga" : "kom";
  },
);

const catalogItemLabel = computed(() =>
  state.type === "service" ? "usluga" : "proizvod",
);

const submitAttempted = ref(false);

async function onSubmit(event: FormSubmitEvent<CatalogItemFormData>) {
  submitAttempted.value = true;
  toast.add({
    title: props.item
      ? `${state.type === "service" ? "Usluga" : "Proizvod"} je izmenjen${state.type === "service" ? "a" : ""}.`
      : `Vaš${state.type === "service" ? "a" : ""} ${catalogItemLabel.value} je sačuvan${state.type === "service" ? "a" : ""}.`,
    color: "success",
    duration: 2000,
  });
  emit("saved", event.data);
  console.log(event.data);
}

async function onError(event: FormErrorEvent) {
  // alert("error");
  console.log("Submit errors", event.errors);
  submitAttempted.value = true;
}
</script>

<template>
  <UPageCard class="w-full max-w-md mx-auto">
    <URadioGroup
      v-if="!props.item"
      v-model="state.type"
      value-key="id"
      :items="catalogItems"
      indicator="hidden"
      orientation="horizontal"
      variant="table"
      size="xs"
      class="w-full mb-3 [&>fieldset>label]:grow [&>fieldset>label]:hover:cursor-pointer"
    />
    <UForm
      :schema="catalogItemSchema"
      :state="state"
      class="space-y-4"
      :validate-on-input-delay="0"
      novalidate
      @submit="onSubmit"
      @error="onError"
    >
      <UFormField label="Naziv" name="name" eager-validation required>
        <UInput
          v-model="state.name"
          class="w-full"
          :placeholder="state.type === 'service' ? 'Krečenje' : 'Stolica'"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Opis"
        name="description"
        eager-validation
      >
        <UInput v-model="state.description" class="w-full" placeholder="Opis" />
      </UFormField>

      <UFormField label="Jedinica mere" name="unit" eager-validation required>
        <USelect v-model="state.unit" :items="unitOptions" class="w-full" />
      </UFormField>

      <UFormField label="Cena" name="price" eager-validation required>
        <UInput
          v-model="state.price"
          class="w-full"
          inputmode="decimal"
          placeholder="3000"
        />
      </UFormField>

      <UButton type="submit" class="w-full justify-center">Sačuvaj</UButton>
    </UForm>

    <p class="text-[14px]!">
      <span class="text-red-400">*</span> označava obavezna polja
    </p>
  </UPageCard>
</template>
