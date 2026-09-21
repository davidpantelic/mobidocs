<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import {
  clientSchema,
  type ClientType,
  type ClientFormData,
  type ClientFormState,
} from "@/schemas/client";

const toast = useToast();
const props = defineProps<{
  onboarding: boolean;
  client?: ClientFormData;
}>();

const emit = defineEmits<{
  saved: [client: ClientFormData];
}>();

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

const state = reactive<ClientFormState>({
  type: "company",
  name: "",
  shortName: "",
  address: "",
  place: "",
  postalCode: "",
  email: "",
  phone: "",
  pib: "",
  bankAccount: "",
  mb: "",
  contactPerson: "",
  note: "",
  ...props.client,
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

async function onSubmit(event: FormSubmitEvent<ClientFormData>) {
  submitAttempted.value = true;
  toast.add({
    title: props.client
      ? "Podaci klijenta su izmenjeni."
      : props.onboarding
        ? "Vaš prvi klijent je sačuvan."
        : "Klijent je dodat.",
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
  <UPageCard class="w-full max-w-md mx-auto border-0!" variant="subtle">
    <URadioGroup
      v-if="!props.client"
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
      :schema="clientSchema"
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
        :hint="state.note?.length + '/300'"
        eager-validation
      >
        <UTextarea v-model="state.note" class="w-full" autoresize />
      </UFormField>

      <UButton type="submit" class="w-full justify-center"> Sačuvaj </UButton>
    </UForm>

    <p class="text-[14px]!">
      <span class="text-red-400">*</span> označava obavezna polja
    </p>
  </UPageCard>
</template>
