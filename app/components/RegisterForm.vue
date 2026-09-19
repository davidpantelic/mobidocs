<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "username",
    type: "text",
    label: "Korisničko ime",
    placeholder: "Unesite korisničko ime",
    required: true,
  },
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
  {
    name: "passwordConfirm",
    type: "password",
    label: "Potvrdite lozinku",
    placeholder: "Potvrdite lozinku",
    required: true,
  },
  // {
  //   name: "remember",
  //   label: "Zapamti me",
  //   type: "checkbox",
  // },
];

const schema = z
  .object({
    username: z
      .string("Korisničko ime je obavezno")
      // .min(1, { message: "Korisničko ime je obavezno" })
      .max(10, { message: "Korisničko ime može imati najviše 10 karaktera" }),
    email: z.email("Ispravan email je obavezan"),
    password: z
      .string("Lozinka je obavezna")
      .min(8, "Lozinka mora imati najmanje 8 karaktera"),
    passwordConfirm: z.string("Obavezno je da potvrdite lozinku"),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "Lozinka nije ista",
      });
    }
  });

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
        title="Registrujte se"
        description=""
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        :submit="{ label: 'Registrujte se' }"
        @submit="onSubmit"
      >
        <template #separator>
          <USeparator label="ili" />
        </template>

        <template v-if="error" #validation>
          <LazyUAlert
            color="error"
            icon="i-lucide-info"
            title="Greška u registraciji..."
          />
        </template>

        <template #footer>
          <p>
            Registracijom se slažete sa našim<br />
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
            Imate nalog? Prijavite se
            <ULink to="/login" class="text-primary font-medium">ovde</ULink>.
          </p>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
