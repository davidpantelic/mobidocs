<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ClientFormData } from "@/schemas/client";

const props = defineProps<{
  client: ClientFormData;
}>();

const emit = defineEmits<{
  createInvoice: [];
  edit: [];
  delete: [];
}>();

const isMobile = useIsMobile();

const detailsOpen = ref(false);

const actionItems: DropdownMenuItem[][] = [
  [
    {
      label: "Kreiraj fakturu",
      icon: "i-lucide-file",
      onSelect: () => emit("createInvoice"),
    },
  ],
  [
    {
      label: "Izmeni",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit"),
    },
    {
      label: "Obriši",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => emit("delete"),
    },
  ],
];

const isCompany = computed(() => props.client.type === "company");

const typeLabel = computed(() =>
  isCompany.value ? "Pravno lice" : "Fizičko lice",
);

const displayName = computed(() => props.client.shortName || props.client.name);

const phoneHref = computed(() =>
  props.client.phone
    ? `tel:${props.client.phone.replace(/[^\d+]/g, "")}`
    : undefined,
);

const googleMapsHref = computed(() => {
  const address = `${props.client.address}, ${props.client.postalCode} ${props.client.place}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
});

const businessDetails = computed(() => {
  const details = [
    { label: "PIB", value: isCompany.value ? props.client.pib : undefined },
    {
      label: "Matični broj",
      value: isCompany.value ? props.client.mb : undefined,
    },
    { label: "Broj računa", value: props.client.bankAccount },
    {
      label: "Kontakt osoba",
      value: isCompany.value ? props.client.contactPerson : undefined,
    },
  ];

  return details.filter((detail): detail is { label: string; value: string } =>
    Boolean(detail.value),
  );
});

function toggleDetails() {
  detailsOpen.value = !detailsOpen.value;
}
</script>

<template>
  <UPageCard
    variant="subtle"
    class="self-start rounded-lg text-left select-text"
    :ui="{
      container: 'gap-y-0 p-2 sm:p-4 w-full',
    }"
  >
    <div class="min-h-11 flex min-w-0 items-start justify-between gap-3 mb-4">
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated text-primary ring ring-default"
        >
          <UIcon
            :name="isCompany ? 'i-lucide-building-2' : 'i-lucide-user'"
            class="size-5"
          />
        </div>

        <div class="min-w-0">
          <h2 class="truncate text-base! font-medium! text-highlighted">
            {{ displayName }}
          </h2>
          <p
            v-if="client.shortName"
            class="truncate text-xs! text-muted sm:text-sm!"
          >
            {{ client.name }}
          </p>
        </div>
      </div>

      <div
        class="w-min sm:w-auto flex flex-wrap shrink-0 items-center justify-end gap-1 sm:gap-2 gap-x-2"
      >
        <div class="basis-full flex justify-end sm:basis-0">
          <UBadge
            :label="typeLabel"
            color="neutral"
            variant="subtle"
            :size="isMobile ? 'sm' : 'lg'"
          />
        </div>

        <UButton
          icon="i-lucide-chevron-down"
          color="neutral"
          variant="outline"
          size="sm"
          square
          :aria-expanded="detailsOpen"
          :aria-label="
            detailsOpen
              ? `Sakrij detalje za ${client.name}`
              : `Prikaži detalje za ${client.name}`
          "
          :ui="{
            leadingIcon: [
              'transition-transform duration-200',
              detailsOpen ? 'rotate-180' : '',
            ],
          }"
          @click="toggleDetails"
        />

        <UDropdownMenu
          :items="actionItems"
          :content="{ align: 'end', collisionPadding: 8 }"
          :ui="{
            content: 'transition-none',
            item: 'transition-none before:transition-none',
            itemLeadingIcon: 'transition-none',
          }"
        >
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="outline"
            size="sm"
            class="group-data-[state=open]:bg-primary-500 group-data-[state=open]:text-white"
            square
            :aria-label="`Opcije za klijenta ${client.name}`"
          />
        </UDropdownMenu>
      </div>
    </div>

    <div class="flex flex-wrap gap-x-5 gap-y-3 items-center">
      <a
        :href="googleMapsHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Otvori adresu u Google mapama"
        class="group flex w-fit max-w-full items-center gap-2 text-sm text-info outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0" />
        <span
          class="truncate min-w-0 wrap-break-word underline decoration-primary/50 underline-offset-4 group-hover:decoration-primary"
        >
          {{ client.address }}, {{ client.postalCode }} {{ client.place }}
          <UIcon
            name="i-lucide-external-link"
            class="mt-0.5 size-3.5 shrink-0"
          />
        </span>
      </a>

      <a
        v-if="client.email"
        :href="`mailto:${client.email}`"
        aria-label="Pošalji email klijentu"
        class="group flex w-fit max-w-full items-center gap-2 text-sm text-info outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <UIcon name="i-lucide-mail" class="size-4 shrink-0" />
        <span
          class="truncate min-w-0 break-all underline decoration-primary/50 underline-offset-4 group-hover:decoration-primary"
        >
          {{ client.email }}
        </span>
      </a>

      <a
        v-if="client.phone"
        :href="phoneHref"
        aria-label="Pozovi klijenta"
        class="group flex w-fit max-w-full items-center gap-2 text-sm text-info outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <UIcon name="i-lucide-phone-call" class="size-4 shrink-0" />
        <span
          class="truncate underline decoration-primary/50 underline-offset-4 group-hover:decoration-primary"
        >
          {{ client.phone }}
        </span>
      </a>
    </div>

    <UCollapsible v-model:open="detailsOpen" class="w-full">
      <template #content>
        <div class="space-y-4 sm:space-y-5 mt-5">
          <template v-if="businessDetails.length">
            <LazyUSeparator />

            <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div v-for="detail in businessDetails" :key="detail.label">
                <dt class="text-xs text-muted">
                  {{ detail.label }}
                </dt>
                <dd class="mt-0.5 wrap-break-word text-sm text-highlighted">
                  {{ detail.value }}
                </dd>
              </div>
            </dl>
          </template>

          <template v-if="client.note">
            <LazyUSeparator />

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-sticky-note"
                class="mt-0.5 size-4 shrink-0 text-muted"
              />
              <div class="min-w-0">
                <p class="text-xs! text-muted">Napomena</p>
                <p
                  class="mt-1 whitespace-pre-wrap wrap-break-word text-sm! text-toned"
                >
                  {{ client.note }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </template>
    </UCollapsible>
  </UPageCard>
</template>
