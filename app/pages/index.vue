<script setup lang="ts">
import { useOnboardingStore } from "@/stores/onboarding";

const onboardingStore = useOnboardingStore();

const userLoggedIn = ref(true);
</script>

<template>
  <div>
    <LazyWelcome v-if="!userLoggedIn" />
    <LazyOnboarding
      v-else-if="userLoggedIn && !onboardingStore.onboardingFinished"
    />
    <div v-else>spremno</div>
  </div>
</template>
