<script setup lang="ts">
import * as z from "zod";
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
}>();

type SelectOption = {
  label: string;
  value: string;
};

const vatStatusOptions: SelectOption[] = [
  { label: "U sistemu PDV-a", value: "vatOn" },
  { label: "Nije u sistemu PDV-a", value: "vatOff" },
];

const companyTypeOptions: SelectOption[] = [
  { label: "DOO", value: "doo" },
  { label: "Preduzetnik", value: "pr" },
  { label: "Ostalo", value: "other" },
];

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ime firme je obavezan")
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
    .max(50, "Adresa može sadržati maksimalno 50 karaktera")
    .min(1, "Adresa firme je obavezna"),
  place: z
    .string()
    .trim()
    .max(20, "Grad/mesto može sadržati maksimalno 20 karaktera")
    .min(1, "Grad/mesto firme je obavezno"),
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
  pib: z
    .string()
    .trim()
    .min(1, "PIB firme je obavezan")
    .regex(/^\d{9}$/, "PIB mora imati tačno 9 cifara"),
  vatStatus: z.enum(["vatOn", "vatOff"]),
  companyType: z.enum(["doo", "pr", "other"]).optional().or(z.literal("")),
  bankAccount: z
    .string()
    .trim()
    .min(1, "Broj računa je obavezan")
    .regex(/^\d{3}-\d{1,13}-\d{2}$/, "Broj računa nije u ispravnom formatu"),
  mb: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Matični broj mora imati tačno 8 cifara")
    .optional()
    .or(z.literal("")),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  shortName: "",
  address: "",
  place: "",
  email: "",
  phone: "",
  pib: "",
  vatStatus: "vatOn",
  companyType: props.onboarding ? "" : "doo",
  bankAccount: "",
  mb: "",
});

const submitAttempted = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitAttempted.value = true;
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
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
  <p class="max-w-xl mx-auto mb-8 text-center text-pretty">
    Unesite podatke svoje firme, obavezna polja su neophodna kako bi vaši
    dokumenti bili validni. Kasnije možete dodati ili izmeniti podatke.
  </p>
  <UPageCard class="w-full max-w-md mx-auto">
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      :validate-on-input-delay="0"
      novalidate
      @submit="onSubmit"
      @error="onError"
    >
      <UFormField label="Puno ime" name="name" eager-validation required>
        <UInput v-model="state.name" class="w-full" placeholder="Ime DOO/PR" />
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
        label="Broj računa"
        name="bankAccount"
        :eager-validation="submitAttempted"
        required
      >
        <UInput
          v-model="state.bankAccount"
          class="w-full"
          inputmode="numeric"
          placeholder="160-1234567890123-45"
        />
      </UFormField>

      <UFormField
        label="PIB"
        name="pib"
        :eager-validation="submitAttempted"
        required
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
        label="PDV status"
        name="vatStatus"
        :eager-validation="submitAttempted"
        required
      >
        <URadioGroup
          orientation="horizontal"
          variant="list"
          v-model="state.vatStatus"
          :items="vatStatusOptions"
          class="mt-2 [&>fieldset]:gap-x-5 [&>fieldset]:gap-y-3 [&_label]:hover:cursor-pointer [&>fieldset]:flex-wrap"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
        label="Tip subjekta"
        name="mb"
        :eager-validation="submitAttempted"
      >
        <URadioGroup
          orientation="horizontal"
          variant="list"
          v-model="state.companyType"
          :items="companyTypeOptions"
          class="mt-2 [&>fieldset]:gap-x-5 [&>fieldset]:gap-y-3 [&_label]:hover:cursor-pointer [&>fieldset]:flex-wrap"
        />
      </UFormField>

      <UFormField
        v-if="!props.onboarding"
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
        v-if="!props.onboarding"
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

      <UButton type="submit" class="w-full justify-center">Sačuvaj</UButton>
    </UForm>

    <p class="text-[14px]!">
      <span class="text-red-400">*</span> označava obavezna polja
    </p>
  </UPageCard>
</template>
