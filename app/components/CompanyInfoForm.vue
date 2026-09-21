<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
  companySchema,
  type CompanyFormData,
  type CompanyFormState,
  type CompanyType,
  type VatStatus,
} from "@/schemas/company";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
}>();

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

const vatStatusOptions: SelectOption<VatStatus>[] = [
  { label: "U sistemu PDV-a", value: "vatOn" },
  { label: "Nije u sistemu PDV-a", value: "vatOff" },
];

const companyTypeOptions: SelectOption<CompanyType>[] = [
  { label: "DOO", value: "doo" },
  { label: "Preduzetnik", value: "pr" },
  { label: "Ostalo", value: "other" },
];

const state = reactive<CompanyFormState>({
  name: "",
  shortName: "",
  address: "",
  place: "",
  postalCode: "",
  email: "",
  phone: "",
  pib: "",
  vatStatus: "vatOn",
  companyType: undefined,
  bankAccount: "",
  mb: "",
});

const submitAttempted = ref(false);

async function onSubmit(event: FormSubmitEvent<CompanyFormData>) {
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
  <UPageCard class="w-full max-w-md mx-auto">
    <UForm
      :schema="companySchema"
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
        label="Poštanski broj"
        name="postalCode"
        :eager-validation="submitAttempted"
        :hint="state.postalCode.length + '/5'"
        required
      >
        <UInput
          v-model="state.postalCode"
          class="w-full"
          inputmode="numeric"
          maxlength="5"
          placeholder="14253"
        />
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
        name="companyType"
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
