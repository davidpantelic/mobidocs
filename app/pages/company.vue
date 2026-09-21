<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { CompanyType } from "@/schemas/company";
import { useCompanyStore } from "@/stores/company";

const companyStore = useCompanyStore();
const { company } = storeToRefs(companyStore);

const editModalOpen = ref(false);
const editFormKey = ref(0);

const companyTypeLabels: Record<CompanyType, string> = {
  doo: "DOO",
  pr: "Preduzetnik",
  other: "Ostalo",
};

const companyTypeLabel = computed(() =>
  company.value.companyType
    ? companyTypeLabels[company.value.companyType]
    : "Nije navedeno",
);

const vatStatusLabel = computed(() =>
  company.value.vatStatus === "vatOn"
    ? "U sistemu PDV-a"
    : "Nije u sistemu PDV-a",
);

const phoneHref = computed(() =>
  company.value.phone
    ? `tel:${company.value.phone.replace(/[^\d+]/g, "")}`
    : undefined,
);

const googleMapsHref = computed(() => {
  const address = `${company.value.address}, ${company.value.postalCode} ${company.value.place}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
});

function openEditModal() {
  editFormKey.value += 1;
  editModalOpen.value = true;
}

function closeEditModal() {
  editModalOpen.value = false;
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl text-left">
    <UiPageHeader title="Moja firma" icon="i-lucide-building-2" />

    <div class="mb-4 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 class="truncate text-xl! font-semibold! text-highlighted">
          {{ company.shortName || company.name }}
        </h2>
        <p v-if="company.shortName" class="mt-1 text-sm! text-muted">
          {{ company.name }}
        </p>
      </div>

      <UButton
        label="Izmeni"
        icon="i-lucide-pencil"
        color="primary"
        variant="soft"
        class="shrink-0"
        @click="openEditModal"
      />
    </div>

    <div class="flex flex-wrap gap-2 border-y border-default py-4">
      <UBadge
        :label="companyTypeLabel"
        color="neutral"
        variant="subtle"
        size="lg"
      />
      <UBadge
        :label="vatStatusLabel"
        :color="company.vatStatus === 'vatOn' ? 'success' : 'neutral'"
        variant="subtle"
        size="lg"
      />
    </div>

    <div class="grid grid-cols-1 gap-x-10 gap-y-8 py-6 md:grid-cols-2">
      <section>
        <h3 class="mb-4 text-sm! font-medium! text-muted">
          Registracioni podaci
        </h3>
        <dl class="space-y-4">
          <div>
            <dt class="text-xs text-muted">PIB</dt>
            <dd class="mt-1 text-sm text-highlighted">{{ company.pib }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">Matični broj</dt>
            <dd class="mt-1 text-sm text-highlighted">
              {{ company.mb || "Nije naveden" }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted">Tip subjekta</dt>
            <dd class="mt-1 text-sm text-highlighted">
              {{ companyTypeLabel }}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 class="mb-4 text-sm! font-medium! text-muted">Sedište firme</h3>
        <a
          :href="googleMapsHref"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex max-w-full items-start gap-2 text-sm text-info outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0" />
          <span
            class="wrap-break-word underline decoration-primary/50 underline-offset-4 group-hover:decoration-primary"
          >
            {{ company.address }}, {{ company.postalCode }} {{ company.place }}
          </span>
          <UIcon
            name="i-lucide-external-link"
            class="mt-0.5 size-3.5 shrink-0"
          />
        </a>
      </section>

      <section>
        <h3 class="mb-4 text-sm! font-medium! text-muted">Kontakt</h3>
        <div class="space-y-3">
          <a
            v-if="company.email"
            :href="`mailto:${company.email}`"
            class="flex w-fit max-w-full items-center gap-2 text-sm text-info underline decoration-primary/50 underline-offset-4 hover:decoration-primary"
          >
            <UIcon name="i-lucide-mail" class="size-4 shrink-0" />
            <span class="truncate">{{ company.email }}</span>
          </a>
          <a
            v-if="company.phone"
            :href="phoneHref"
            class="flex w-fit max-w-full items-center gap-2 text-sm text-info underline decoration-primary/50 underline-offset-4 hover:decoration-primary"
          >
            <UIcon name="i-lucide-phone-call" class="size-4 shrink-0" />
            <span>{{ company.phone }}</span>
          </a>
          <p v-if="!company.email && !company.phone" class="text-sm text-muted">
            Kontakt podaci nisu navedeni.
          </p>
        </div>
      </section>

      <section>
        <h3 class="mb-4 text-sm! font-medium! text-muted">Podaci za uplatu</h3>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-landmark" class="size-4 shrink-0 text-muted" />
          <span class="break-all text-sm text-highlighted">
            {{ company.bankAccount }}
          </span>
        </div>
      </section>
    </div>

    <UModal
      v-model:open="editModalOpen"
      title="Izmenite podatke firme"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <LazyCompanyInfoForm
          :key="editFormKey"
          :onboarding="false"
          @saved="closeEditModal"
        />
      </template>
    </UModal>
  </div>
</template>
