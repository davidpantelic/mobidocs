import { defineStore } from "pinia";
import type { CatalogItemFormData } from "@/schemas/catalog-item";

export type CatalogItem = CatalogItemFormData & { id: string };

export const useCatalogItemsStore = defineStore("catalogItems", () => {
  const catalogItems = ref<CatalogItem[]>([
    {
      id: "item_1",
      type: "service",
      name: "Izrada poslovnog web sajta",
      description:
        "Dizajn i izrada responzivnog poslovnog sajta sa osnovnom SEO optimizacijom.",
      unit: "usluga",
      price: 85000,
    },
    {
      id: "item_2",
      type: "service",
      name: "Mesečno održavanje web sajta",
      description:
        "Redovno ažuriranje sadržaja, sigurnosne provere i tehnička podrška.",
      unit: "mesec",
      price: 18000,
    },
    {
      id: "item_3",
      type: "service",
      name: "Poslovne konsultacije",
      description: "Analiza poslovnog procesa i savetovanje po satu.",
      unit: "sat",
      price: 6000,
    },
    {
      id: "item_4",
      type: "product",
      name: "Ergonomska kancelarijska stolica",
      description:
        "Kancelarijska stolica sa podesivim naslonom, rukonaslonima i lumbalnom podrškom.",
      unit: "kom",
      price: 24990,
    },
    {
      id: "item_5",
      type: "product",
      name: "Papir za štampu A4, 500 listova",
      description: "Beli kancelarijski papir gramature 80 g/m².",
      unit: "paket",
      price: 749,
    },
  ]);

  function addCatalogItem(data: CatalogItemFormData) {
    const item: CatalogItem = {
      ...data,
      id: `item_${Date.now()}`,
    };

    catalogItems.value.push(item);
    return item;
  }

  function updateCatalogItem(id: string, data: CatalogItemFormData) {
    const index = catalogItems.value.findIndex((item) => item.id === id);

    if (index !== -1) {
      catalogItems.value[index] = { ...data, id };
    }
  }

  function deleteCatalogItem(id: string) {
    catalogItems.value = catalogItems.value.filter((item) => item.id !== id);
  }

  function getCatalogItemById(id: string) {
    return catalogItems.value.find((item) => item.id === id);
  }

  return {
    catalogItems,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    getCatalogItemById,
  };
});
