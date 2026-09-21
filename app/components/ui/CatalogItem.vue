<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { CatalogItemFormData, UnitValue } from "@/schemas/catalog-item";

const props = defineProps<{
  item: CatalogItemFormData;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();

const isMobile = useIsMobile();

const actionItems: DropdownMenuItem[] = [
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
];

const unitLabels: Record<UnitValue, string> = {
  usluga: "usluga",
  sat: "sat",
  dan: "dan",
  mesec: "mesec",
  pausal: "paušal",
  kom: "kom",
  kg: "kg",
  l: "l",
  m: "m",
  paket: "paket",
};

const isService = computed(() => props.item.type === "service");
const typeLabel = computed(() => (isService.value ? "Usluga" : "Proizvod"));

const formattedPrice = computed(() =>
  new Intl.NumberFormat("sr-Latn-RS", {
    style: "currency",
    currency: "RSD",
    maximumFractionDigits: 2,
  }).format(props.item.price),
);
</script>

<template>
  <UPageCard
    variant="subtle"
    class="self-start rounded-lg text-left select-text"
    :ui="{ container: 'gap-4 p-2 sm:p-4 w-full place-self-start' }"
  >
    <div class="max-h-16 flex min-w-0 items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated text-primary ring ring-default"
        >
          <UIcon
            :name="
              isService ? 'i-lucide-briefcase-business' : 'i-lucide-package'
            "
            class="size-5"
          />
        </div>

        <div class="min-w-0">
          <h2
            class="truncate text-base! font-medium! text-highlighted"
            :title="item.name"
          >
            {{ item.name }}
          </h2>
          <p class="mt-0.5 text-sm! text-toned">
            {{ formattedPrice }} / {{ unitLabels[item.unit] }}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <UBadge
          :label="typeLabel"
          color="neutral"
          variant="subtle"
          :size="isMobile ? 'md' : 'lg'"
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
            :size="isMobile ? 'xs' : 'sm'"
            square
            :aria-label="`Opcije za ${typeLabel.toLowerCase()} ${item.name}`"
          />
        </UDropdownMenu>
      </div>
    </div>

    <p v-if="item.description" class="text-sm! text-toned">
      {{ item.description }}
    </p>
  </UPageCard>
</template>
