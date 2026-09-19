<script setup lang="ts">
import * as z from "zod";
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
}>();

const catalogItemTypes = ["service", "product"] as const;

type CatalogItemType = (typeof catalogItemTypes)[number];
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

const unitValues = [
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

const schema = z.object({
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

type State = z.input<typeof schema>;
type Schema = z.output<typeof schema>;

const state = reactive<State>({
  type: "service",
  name: "",
  description: "",
  unit: "usluga",
  price: "",
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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitAttempted.value = true;
  toast.add({
    title: `Vaš${state.type == "service" ? "a" : ""} ${catalogItemLabel.value} je sačuvan${state.type == "service" ? "a" : ""}.`,
    // description: "The form has been submitted.",
    color: "success",
    duration: 2000,
  });
  console.log(event.data);
}

async function onError(event: FormErrorEvent) {
  // alert("error");
  console.log("Submit errors", event.errors);
  submitAttempted.value = true;
}
</script>

<template>
  <p class="max-w-sm mx-auto mb-8 text-center text-pretty">
    Dodajte svoju prvu uslugu ili proizvod. Kasnije možete dodati jos ili
    izmeniti postojeće.
  </p>
  <UPageCard class="w-full max-w-md mx-auto">
    <URadioGroup
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
      :schema="schema"
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
