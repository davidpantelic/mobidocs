<script lang="ts" setup>
import type { ClientFormData, ClientType } from "@/schemas/client";

const clientFormDisplayed = ref(false);
const deleteModalDisplayed = ref(false);
const searchQuery = ref("");
const toast = useToast();

type ClientFilter = ClientType | "all";
type ClientFilterOption = {
  label: string;
  value: ClientFilter;
};

type ClientSort = "name-asc" | "name-desc";
type ClientSortOption = {
  label: string;
  value: ClientSort;
};

const selectedType = ref<ClientFilter>("all");
const selectedSort = ref<ClientSort>("name-asc");

const clientTypeOptions: ClientFilterOption[] = [
  { label: "Svi klijenti", value: "all" },
  { label: "Pravna lica", value: "company" },
  { label: "Fizička lica", value: "person" },
];

const clientSortOptions: ClientSortOption[] = [
  { label: "Naziv A-Z", value: "name-asc" },
  { label: "Naziv Z-A", value: "name-desc" },
];

const clientNameCollator = new Intl.Collator("sr-Latn-RS", {
  sensitivity: "base",
  numeric: true,
});

type ClientListItem = ClientFormData & { id: string };

const editingClient = ref<ClientListItem>();
const clientPendingDeletion = ref<ClientListItem>();

const clients = ref<ClientListItem[]>([
  {
    id: "client_1",
    type: "company",
    name: "Webdak Solutions DOO",
    shortName: "Webdak",
    address: "Plužac 18",
    place: "Osečina",
    postalCode: "14253",
    email: "davidpantelic1996@gmail.com",
    phone: "0677204115",
    pib: "123456789",
    bankAccount: "123-123123-12",
    mb: "12345678",
    contactPerson: "David Pantelic",
    note: "Klijent napomena ide ovde!",
  },
  {
    id: "client_2",
    type: "person",
    name: "David Pantelic",
    shortName: "",
    address: "Pluzac 31",
    place: "Osecina",
    postalCode: "14253",
    email: "davidpantelic1996@gmail.com",
    phone: "0677204115",
    pib: "",
    bankAccount: "123-123123-12",
    mb: "",
    contactPerson: "",
    note: "dsfsdfdf",
  },
  {
    id: "client_3",
    type: "company",
    name: "Redak Solutions DOOWebdak Solutions DOOWebdak Solutions DOO",
    shortName: "RedakWebdak Solutions DOO",
    address: "Plužac 18Plužac 18Plužac 18",
    place: "OsečinaOsečina Osečina",
    postalCode: "14253",
    email: "davidpanteliOsečinaOsečinac1996@gmail.com",
    phone: "0677204115",
    pib: "123456789",
    bankAccount: "123-123123-12",
    mb: "12345678",
    contactPerson: "David PantelicOsečina",
    note: "Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napomena ide ovde!Klijent napom!",
  },
  {
    id: "client_4",
    type: "person",
    name: "Marko Markovic",
    shortName: "",
    address: "Pluzac 31",
    place: "Osecina",
    postalCode: "14253",
    email: "davidpantelic1996@gmail.com",
    phone: "0677204115",
    pib: "",
    bankAccount: "123-123123-12",
    mb: "",
    contactPerson: "",
    note: "dsfsdfdf",
  },
  {
    id: "client_5",
    type: "person",
    name: "Stojan",
    shortName: "",
    address: "Plu 31",
    place: "Sabac",
    postalCode: "15000",
    email: "dav196@gmail.com",
    phone: "06772115",
    pib: "",
    bankAccount: "123-123123-12",
    mb: "",
    contactPerson: "",
    note: "",
  },
]);

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("sr-Latn-RS")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const filteredClients = computed(() => {
  const query = normalizeSearchValue(searchQuery.value);

  return clients.value.filter((client) => {
    const matchesType =
      selectedType.value === "all" || client.type === selectedType.value;
    const matchesSearch =
      !query ||
      [client.name, client.shortName].some((value) =>
        normalizeSearchValue(value || "").includes(query),
      );

    return matchesType && matchesSearch;
  });
});

const sortedClients = computed(() => {
  const direction = selectedSort.value === "name-asc" ? 1 : -1;

  return [...filteredClients.value].sort((firstClient, secondClient) => {
    const firstName = firstClient.shortName || firstClient.name;
    const secondName = secondClient.shortName || secondClient.name;

    return clientNameCollator.compare(firstName, secondName) * direction;
  });
});

const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || selectedType.value !== "all",
);

function resetFilters() {
  searchQuery.value = "";
  selectedType.value = "all";
}

function clearSearch() {
  searchQuery.value = "";
}

function openCreateForm() {
  editingClient.value = undefined;
  clientFormDisplayed.value = true;
}

function openEditForm(client: ClientListItem) {
  editingClient.value = client;
  clientFormDisplayed.value = true;
}

function saveClient(data: ClientFormData) {
  if (editingClient.value) {
    const index = clients.value.findIndex(
      (client) => client.id === editingClient.value?.id,
    );

    if (index !== -1) {
      clients.value[index] = {
        ...data,
        id: editingClient.value.id,
      };
    }
  } else {
    clients.value.push({
      ...data,
      id: `client_${Date.now()}`,
    });
  }

  clientFormDisplayed.value = false;
  editingClient.value = undefined;
}

function openDeleteModal(client: ClientListItem) {
  clientPendingDeletion.value = client;
  deleteModalDisplayed.value = true;
}

function deleteClient() {
  if (!clientPendingDeletion.value) {
    return;
  }

  const deletedClientName = clientPendingDeletion.value.name;
  clients.value = clients.value.filter(
    (client) => client.id !== clientPendingDeletion.value?.id,
  );
  deleteModalDisplayed.value = false;
  clientPendingDeletion.value = undefined;

  toast.add({
    title: "Klijent je obrisan.",
    description: deletedClientName,
    color: "success",
    duration: 2000,
  });
}

const closeDeleteModal = () => {
  deleteModalDisplayed.value = false;
};
</script>

<template>
  <div class="text-center">
    <UiPageHeader title="Klijenti" icon="i-lucide-users" />

    <p v-if="clients.length === 0">Trenutno nemate nijednog klijenta.</p>

    <div
      v-if="clients.length > 0"
      class="mx-auto mb-4 flex w-full max-w-6xl flex-col gap-3 sm:flex-row"
    >
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Pretraži po nazivu ili imenu"
        aria-label="Pretraži klijente"
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
        :items="clientTypeOptions"
        icon="i-lucide-list-filter"
        aria-label="Filtriraj klijente po tipu"
        class="w-full sm:w-40"
      />

      <USelect
        v-model="selectedSort"
        :items="clientSortOptions"
        icon="i-lucide-arrow-up-down"
        aria-label="Sortiraj klijente"
        class="w-full sm:w-40"
      />
    </div>

    <div
      v-if="clients.length > 0"
      class="mx-auto mb-3 flex w-full max-w-6xl justify-start"
    >
      <p class="text-xs! text-muted">
        Prikazano: {{ filteredClients.length }} od {{ clients.length }}
      </p>
    </div>

    <div
      v-if="sortedClients.length > 0"
      class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4"
    >
      <UiClient
        v-for="item in sortedClients"
        :key="item.id"
        :client="item"
        @edit="openEditForm(item)"
        @delete="openDeleteModal(item)"
      />
    </div>

    <div
      v-else-if="clients.length > 0"
      class="mx-auto flex max-w-6xl flex-col items-center py-12 text-center"
    >
      <UIcon name="i-lucide-search-x" class="mb-3 size-8 text-muted" />
      <h2 class="text-base! font-medium!">Nema pronađenih klijenata</h2>
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
      aria-label="Dodaj klijenta"
      :class="[clients.length > 0 ? 'fixed bottom-3 right-3' : 'mt-2']"
      @click="openCreateForm"
    />

    <UModal
      v-model:open="clientFormDisplayed"
      :title="editingClient ? 'Izmenite klijenta' : 'Dodajte klijenta'"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <LazyClientForm
          :key="editingClient?.id ?? 'new-client'"
          :onboarding="false"
          :client="editingClient"
          variant="naked"
          @saved="saveClient"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="deleteModalDisplayed"
      title="Obrišite klijenta?"
      :description="clientPendingDeletion?.name"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <p class="text-sm text-toned">
          Ova radnja je trajna i klijent će biti uklonjen iz liste.
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
            @click="deleteClient"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
