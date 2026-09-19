import { defineStore } from "pinia";

export const useOnboardingStore = defineStore("onboarding", () => {
  const onboardingFinished = ref(false);
  const onboardingStep = ref<string>("company");

  const finishOnboarding = () => {
    onboardingFinished.value = true;
  };

  return { onboardingFinished, onboardingStep, finishOnboarding };
});
