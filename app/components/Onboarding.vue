<script lang="ts" setup>
import type { StepperItem } from "@nuxt/ui";
import { useOnboardingStore } from "@/stores/onboarding";

const onboardingStore = useOnboardingStore();
const onboardingStarted = ref(true);
const isReady = ref(false);

onMounted(() => {
  const savedStep = localStorage.getItem("WebdakBiz_onboarding_step");

  if (savedStep) {
    onboardingStore.onboardingStep = savedStep;
  } else {
    onboardingStore.onboardingStep = "company";
    localStorage.setItem("WebdakBiz_onboarding_step", "company");
  }

  isReady.value = true;
});

watch(
  () => onboardingStore.onboardingStep,
  (newVal) => {
    localStorage.setItem("WebdakBiz_onboarding_step", newVal);
  },
);

const onboardingStepItems = computed<StepperItem[]>(() => [
  {
    slot: "company",
    value: "company",
    title: "Podaci firme",
    // description: "Podaci firme",
    icon: "i-lucide-building-2",
  },
  {
    slot: "product",
    value: "product",
    title: "Prvi proizvod ili usluga",
    // description: "Prvi proizvod ili usluga",
    icon: "i-lucide-package",
  },
  {
    slot: "client",
    value: "client",
    title: "Prvi klijent",
    // description: "Prvi klijent",
    icon: "i-lucide-user",
  },
  {
    slot: "invoice",
    value: "invoice",
    title: "Prva faktura",
    // description: "Prvi klijent",
    icon: "i-lucide-file",
  },
]);
</script>

<template>
  <div class="w-full grow">
    <h1 class="text-center">Vodič kroz prve korake</h1>

    <div v-if="!onboardingStarted" class="text-center">
      <p class="my-3">
        Za početak potrebno je da unesete podatke svoje firme, proizvoda ili
        usluga i svog prvog klijenta kako biste koristili Webdak Biz!
      </p>
      <UButton
        @click="
          () => {
            onboardingStarted = true;
          }
        "
        >Počni</UButton
      >
    </div>

    <LazyUStepper
      v-if="onboardingStarted && isReady"
      v-model="onboardingStore.onboardingStep"
      :items="onboardingStepItems"
      class="gap-5 sm:gap-10 mt-5"
      :ui="{
        title: 'text-[12px] sm:text-sm text-balance',
      }"
    >
      <template #company>
        <p class="max-w-xl mx-auto mb-8 text-center text-pretty">
          Unesite podatke svoje firme, obavezna polja su neophodna kako bi vaši
          dokumenti bili validni. Kasnije možete dodati ili izmeniti podatke.
        </p>
        <LazyCompanyInfoForm :onboarding="false" />
      </template>

      <template #product>
        <p class="max-w-sm mx-auto mb-8 text-center text-pretty">
          Dodajte svoju prvu uslugu ili proizvod. Kasnije možete dodati jos ili
          izmeniti postojeće.
        </p>
        <LazyProductServiceForm :onboarding="false" />
      </template>

      <template #client>
        <p class="max-w-md mx-auto mb-8 text-center text-pretty">
          Dodajte svog prvog klijenta kao pravno ili fizičko lice. Kasnije
          možete dodati jos ili izmeniti postojeće.
        </p>
        <LazyClientForm :onboarding="false" />
      </template>

      <template #invoice>
        <p class="max-w-sm mx-auto mb-8 text-center text-pretty">
          Sada vrlo lako možete napraviti svoju prvu fakturu!
        </p>
        <LazyInvoiceForm :onboarding="false" />
      </template>
    </LazyUStepper>
  </div>
</template>
