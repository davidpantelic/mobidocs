<script setup lang="ts">
import { storeToRefs } from "pinia";
import type {
  CatalogItemFormData,
  CatalogItemType,
} from "@/schemas/catalog-item";
import {
  useCatalogItemsStore,
  type CatalogItem,
} from "@/stores/catalogItems";

type CatalogItemListItem = CatalogItem;
type CatalogItemFilter = CatalogItemType | "all";
type CatalogItemSort = "name-asc" | "name-desc" | "price-asc" | "price-desc";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

const itemFormDisplayed = ref(false);
const deleteModalDisplayed = ref(false);
const searchQuery = ref("");
const selectedType = ref<CatalogItemFilter>("all");
const selectedSort = ref<CatalogItemSort>("name-asc");
const editingItem = ref<CatalogItemListItem>();
const itemPendingDeletion = ref<CatalogItemListItem>();
const toast = useToast();
const catalogItemsStore = useCatalogItemsStore();
const { catalogItems } = storeToRefs(catalogItemsStore);

const typeOptions: SelectOption<CatalogItemFilter>[] = [
  { label: "Sve stavke", value: "all" },
  { label: "Usluge", value: "service" },
  { label: "Proizvodi", value: "product" },
];

const sortOptions: SelectOption<CatalogItemSort>[] = [
  { label: "Naziv A-Z", value: "name-asc" },
  { label: "Naziv Z-A", value: "name-desc" },
  { label: "Cena rastuće", value: "price-asc" },
  { label: "Cena opadajuće", value: "price-desc" },
];

const nameCollator = new Intl.Collator("sr-Latn-RS", {
  sensitivity: "base",
  numeric: true,
});

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("sr-Latn-RS")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const filteredItems = computed(() => {
  const query = normalizeSearchValue(searchQuery.value);

  return catalogItems.value.filter((item) => {
    const matchesType =
      selectedType.value === "all" || item.type === selectedType.value;
    const matchesSearch =
      !query ||
      [item.name, item.description].some((value) =>
        normalizeSearchValue(value || "").includes(query),
      );

    return matchesType && matchesSearch;
  });
});

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((firstItem, secondItem) => {
    switch (selectedSort.value) {
      case "name-desc":
        return nameCollator.compare(secondItem.name, firstItem.name);
      case "price-asc":
        return firstItem.price - secondItem.price;
      case "price-desc":
        return secondItem.price - firstItem.price;
      default:
        return nameCollator.compare(firstItem.name, secondItem.name);
    }
  });
});

const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || selectedType.value !== "all",
);

function clearSearch() {
  searchQuery.value = "";
}

function resetFilters() {
  searchQuery.value = "";
  selectedType.value = "all";
}

function openCreateForm() {
  editingItem.value = undefined;
  itemFormDisplayed.value = true;
}

function openEditForm(item: CatalogItemListItem) {
  editingItem.value = item;
  itemFormDisplayed.value = true;
}

function createInvoice(item: CatalogItemListItem) {
  navigateTo({
    path: "/invoices/new",
    query: { itemId: item.id },
  });
}

function saveItem(data: CatalogItemFormData) {
  if (editingItem.value) {
    catalogItemsStore.updateCatalogItem(editingItem.value.id, data);
  } else {
    catalogItemsStore.addCatalogItem(data);
  }

  itemFormDisplayed.value = false;
  editingItem.value = undefined;
}

function openDeleteModal(item: CatalogItemListItem) {
  itemPendingDeletion.value = item;
  deleteModalDisplayed.value = true;
}

function closeDeleteModal() {
  deleteModalDisplayed.value = false;
}

function deleteItem() {
  if (!itemPendingDeletion.value) {
    return;
  }

  const deletedItem = itemPendingDeletion.value;
  catalogItemsStore.deleteCatalogItem(deletedItem.id);
  deleteModalDisplayed.value = false;
  itemPendingDeletion.value = undefined;

  toast.add({
    title: `${deletedItem.type === "service" ? "Usluga" : "Proizvod"} je obrisan${deletedItem.type === "service" ? "a" : ""}.`,
    description: deletedItem.name,
    color: "success",
    duration: 2000,
  });
}
</script>

<template>
  <div class="text-center">
    <UiPageHeader title="Proizvodi i usluge" icon="i-lucide-package" />

    <p v-if="catalogItems.length === 0">
      Trenutno nemate nijedan proizvod ili uslugu.
    </p>

    <div
      v-if="catalogItems.length > 0"
      class="mx-auto mb-4 flex w-full max-w-6xl flex-col gap-3 sm:flex-row"
    >
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Pretraži po nazivu ili opisu"
        aria-label="Pretraži proizvode i usluge"
        class="w-full sm:flex-1"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="link"
            size="xs"
            aria-label="Obriši pretragu"
            class="px-0"
            @click="clearSearch"
          />
        </template>
      </UInput>

      <USelect
        v-model="selectedType"
        :items="typeOptions"
        icon="i-lucide-list-filter"
        aria-label="Filtriraj po tipu stavke"
        class="w-full sm:w-40"
      />

      <USelect
        v-model="selectedSort"
        :items="sortOptions"
        icon="i-lucide-arrow-up-down"
        aria-label="Sortiraj proizvode i usluge"
        class="w-full sm:w-40"
      />
    </div>

    <div
      v-if="catalogItems.length > 0"
      class="mx-auto mb-3 flex w-full max-w-6xl justify-start"
    >
      <p class="text-xs! text-muted">
        Prikazano: {{ filteredItems.length }} od {{ catalogItems.length }}
      </p>
    </div>

    <div
      v-if="sortedItems.length > 0"
      class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <UiCatalogItem
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        class="self-stretch"
        @create-invoice="createInvoice(item)"
        @edit="openEditForm(item)"
        @delete="openDeleteModal(item)"
      />
    </div>

    <div
      v-else-if="catalogItems.length > 0"
      class="mx-auto flex max-w-6xl flex-col items-center py-12 text-center"
    >
      <UIcon name="i-lucide-search-x" class="mb-3 size-8 text-muted" />
      <h2 class="text-base! font-medium!">Nema pronađenih stavki</h2>
      <p class="mt-1 text-sm! text-muted">
        Promenite pojam za pretragu ili izabrani filter.
      </p>
      <UButton
        v-if="hasActiveFilters"
        label="Poništi filtere"
        color="neutral"
        variant="soft"
        class="mt-4"
        @click="resetFilters"
      />
    </div>

    <LazyUButton
      icon="i-lucide-plus"
      label="Dodaj"
      color="primary"
      variant="solid"
      aria-label="Dodaj proizvod ili uslugu"
      :class="[catalogItems.length > 0 ? 'fixed bottom-3 right-3' : 'mt-2']"
      @click="openCreateForm"
    />

    <UModal
      v-model:open="itemFormDisplayed"
      :title="editingItem ? 'Izmenite stavku' : 'Dodajte proizvod ili uslugu'"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <LazyProductServiceForm
          :key="editingItem?.id ?? 'new-item'"
          :onboarding="false"
          :item="editingItem"
          variant="naked"
          @saved="saveItem"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="deleteModalDisplayed"
      title="Obrišite stavku?"
      :description="itemPendingDeletion?.name"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <p class="text-sm text-toned">
          Ova radnja je trajna i stavka će biti uklonjena iz kataloga.
        </p>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Otkaži"
            color="neutral"
            variant="soft"
            @click="closeDeleteModal"
          />
          <UButton
            label="Obriši"
            icon="i-lucide-trash-2"
            color="error"
            @click="deleteItem"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
