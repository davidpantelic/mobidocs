<script setup lang="ts">
import * as z from "zod";
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
}>();

const clientTypes = ["company", "person"] as const;

type ClientType = (typeof clientTypes)[number];
type ClientOption = {
  label: string;
  id: ClientType;
};

const clients: ClientOption[] = [
  {
    label: "Firma",
    id: "company",
  },
  {
    label: "Fizičko lice",
    id: "person",
  },
];

const schema = z
  .object({
    type: z.enum(clientTypes),
    name: z
      .string()
      .trim()
      .min(1, "Ime klijenta je obavezno")
      .max(150, "Ime može sadržati maksimalno 150 karaktera"),
    shortName: z
      .string()
      .trim()
      .max(50, "Skraćeno ime može sadržati maksimalno 50 karaktera")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .trim()
      .min(1, "Adresa klijenta je obavezna")
      .max(50, "Adresa može sadržati maksimalno 50 karaktera"),
    place: z
      .string()
      .trim()
      .min(1, "Grad/mesto klijenta je obavezno")
      .max(20, "Grad/mesto može sadržati maksimalno 20 karaktera"),
    email: z
      .email("Ispravan email je obavezan")
      .max(50, "Email može sadržati maksimalno 50 karaktera")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(15, "Broj telefona može sadržati maksimalno 15 karaktera")
      .optional()
      .or(z.literal("")),
    pib: z.string().trim().optional().or(z.literal("")),
    bankAccount: z
      .string()
      .trim()
      .regex(/^\d{3}-\d{1,13}-\d{2}$/, "Broj računa nije u ispravnom formatu")
      .optional()
      .or(z.literal("")),
    mb: z
      .string()
      .trim()
      .regex(/^\d{8}$/, "Matični broj mora imati tačno 8 cifara")
      .optional()
      .or(z.literal("")),
    contactPerson: z
      .string()
      .trim()
      .max(50, "Ime kontakt osobe može sadržati maksimalno 50 karaktera")
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .trim()
      .max(300, "Napomena može sadržati maksimalno 300 karaktera")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "company") {
      if (!data.pib) {
        ctx.addIssue({
          code: "custom",
          path: ["pib"],
          message: "PIB firme klijenta je obavezan",
        });

        return;
      }
      if (!/^\d{9}$/.test(data.pib)) {
        ctx.addIssue({
          code: "custom",
          path: ["pib"],
          message: "PIB mora imati tačno 9 cifara",
        });
      }
    }
  });

type State = z.input<typeof schema>;
type Schema = z.output<typeof schema>;

const state = reactive<State>({
  type: "company",
  name: "",
  shortName: "",
  address: "",
  place: "",
  email: "",
  phone: "",
  pib: "",
  bankAccount: "",
  mb: "",
});

watch(
  () => state.type,
  (type) => {
    if (type === "person") {
      state.pib = "";
      state.mb = "";
      state.contactPerson = "";
    }
  },
);

const submitAttempted = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitAttempted.value = true;
  toast.add({
    title: "Vaš prvi klijent je sačuvan.",
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
  <p class="max-w-md mx-auto mb-8 text-center text-pretty">
    Dodajte svog prvog klijenta kao pravno ili fizičko lice. Kasnije možete
    dodati jos ili izmeniti postojeće.
  </p>
  <UPageCard class="w-full max-w-md mx-auto">
    <URadioGroup
      v-model="state.type"
      value-key="id"
      :items="clients"
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
      <UFormField label="Ime" name="name" eager-validation required>
        <UInput
          v-model="state.name"
          class="w-full"
          :placeholder="
            state.type === 'company' ? 'Ime DOO/PR' : 'Marko Marković'
          "
        />
      </UFormField>

      <UFormField label="Adresa" name="address" eager-validation required>
        <UInput
          v-model="state.address"
          class="w-full"
          placeholder="Karađorđeva 126"
        />
      </UFormField>

      <UFormField label="Grad/Mesto" name="place" eager-validation required>
        <UInput v-model="state.place" class="w-full" placeholder="Osečina" />
      </UFormField>

      <UFormField
        v-if="state.type == 'company'"
        label="PIB"
        name="pib"
        :eager-validation="submitAttempted"
        :required="state.type == 'company'"
        :hint="state.pib?.length + '/9'"
      >
        <UInput
          v-model="state.pib"
          class="w-full"
          inputmode="numeric"
          placeholder="123456789"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Broj računa"
        name="bankAccount"
        :eager-validation="submitAttempted"
      >
        <UInput
          v-model="state.bankAccount"
          class="w-full"
          inputmode="numeric"
          placeholder="160-1234567890123-45"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding && state.type == 'company'"
        label="Matični broj"
        name="mb"
        :eager-validation="submitAttempted"
        :hint="state.mb?.length + '/8'"
      >
        <UInput
          v-model="state.mb"
          class="w-full"
          inputmode="numeric"
          placeholder="12345678"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Email"
        name="email"
        :eager-validation="submitAttempted"
      >
        <UInput
          v-model="state.email"
          type="email"
          class="w-full"
          placeholder="info@domen.rs"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Broj telefona"
        name="phone"
        eager-validation
      >
        <UInput
          v-model="state.phone"
          type="tel"
          class="w-full"
          inputmode="numeric"
          placeholder="061 234 5678"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding && state.type == 'company'"
        label="Kontakt osoba"
        name="contactPerson"
        eager-validation
      >
        <UInput
          v-model="state.contactPerson"
          class="w-full"
          placeholder="Marko Marković"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding && state.type == 'company'"
        label="Skraćeno ime"
        name="shortName"
        eager-validation
      >
        <UInput
          v-model="state.shortName"
          class="w-full"
          placeholder="Skraćeno ime"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Napomena"
        name="note"
        eager-validation
      >
        <UTextarea v-model="state.note" class="w-full" autoresize />
      </UFormField>

      <UButton type="submit" class="w-full justify-center">Sačuvaj</UButton>
    </UForm>

    <p class="text-[14px]!">
      <span class="text-red-400">*</span> označava obavezna polja
    </p>
  </UPageCard>
</template>
