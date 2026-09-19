<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Unesite email",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Lozinka",
    placeholder: "Unesite lozinku",
    required: true,
  },
  // {
  //   name: "remember",
  //   label: "Zapamti me",
  //   type: "checkbox",
  // },
];

const providers = [
  {
    label: "Google",
    icon: "material-icon-theme:google",
    onClick: () => {
      toast.add({
        id: "google",
        title: "Google",
        description: "Prijava se sa Google nalogom",
      });
    },
  },
];

const schema = z.object({
  email: z.email("Ispravan email je obavezan"),
  password: z
    .string("Lozinka je obavezna")
    .min(8, "Lozinka mora imati najmanje 8 karaktera"),
});

type Schema = z.output<typeof schema>;

const error = ref(false);

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log("Submitted", payload);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Prijavite se"
        description=""
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        :submit="{ label: 'Prijavite se' }"
        @submit="onSubmit"
      >
        <template #separator>
          <USeparator label="ili" />
        </template>

        <template v-if="error" #validation>
          <LazyUAlert
            color="error"
            icon="i-lucide-info"
            title="Greška u prijavi..."
          />
        </template>

        <template #footer>
          <p>
            Prijavom se slažete sa našim<br />
            <ULink to="#" class="text-primary font-medium"
              >Uslovima korišćenja</ULink
            >
            i
            <ULink to="#" class="text-primary font-medium"
              >Politikom privatnosti</ULink
            >.
          </p>
          <br />
          <p>
            Nemate nalog? Registrujte se
            <ULink to="/register" class="text-primary font-medium">ovde</ULink>.
          </p>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
