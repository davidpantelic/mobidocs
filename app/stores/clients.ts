import { defineStore } from "pinia";
import type { ClientFormData } from "@/schemas/client";

export type Client = ClientFormData & { id: string };

export const useClientsStore = defineStore("clients", () => {
  const clients = ref<Client[]>([
    {
      id: "client_1",
      type: "company",
      name: "Primer Projekt DOO Beograd",
      shortName: "Primer Projekt",
      address: "Bulevar kralja Aleksandra 73",
      place: "Beograd",
      postalCode: "11000",
      email: "nabavka@example.com",
      phone: "+381 11 234 5678",
      pib: "109876543",
      bankAccount: "160-0000000012345-67",
      mb: "21876543",
      contactPerson: "Milica Jovanović",
      note: "Fakture dostavljati elektronskim putem.",
    },
    {
      id: "client_2",
      type: "person",
      name: "Marko Jovanović",
      shortName: "",
      address: "Cara Dušana 42",
      place: "Novi Sad",
      postalCode: "21000",
      email: "marko.jovanovic@example.com",
      phone: "+381 64 123 4567",
      pib: "",
      bankAccount: "",
      mb: "",
      contactPerson: "",
      note: "",
    },
    {
      id: "client_3",
      type: "company",
      name: "Studio Linija PR Niš",
      shortName: "Studio Linija",
      address: "Voždova 18",
      place: "Niš",
      postalCode: "18000",
      email: "office@example.com",
      phone: "+381 18 345 678",
      pib: "112345678",
      bankAccount: "205-0000000098765-43",
      mb: "66778899",
      contactPerson: "Nikola Stanković",
      note: "Za ponude i fakture kontaktirati vlasnika.",
    },
    {
      id: "client_4",
      type: "person",
      name: "Jelena Petrović",
      shortName: "",
      address: "Karađorđeva 15",
      place: "Valjevo",
      postalCode: "14000",
      email: "jelena.petrovic@example.com",
      phone: "+381 65 987 6543",
      pib: "",
      bankAccount: "",
      mb: "",
      contactPerson: "",
      note: "Preferira komunikaciju putem emaila.",
    },
    {
      id: "client_5",
      type: "company",
      name: "Zeleni Korak DOO Šabac",
      shortName: "Zeleni Korak",
      address: "Masarikova 26",
      place: "Šabac",
      postalCode: "15000",
      email: "racunovodstvo@example.com",
      phone: "+381 15 345 678",
      pib: "107654321",
      bankAccount: "170-0000000054321-89",
      mb: "20456789",
      contactPerson: "Ana Ilić",
      note: "Valuta plaćanja po dogovoru je 15 dana.",
    },
  ]);

  function addClient(data: ClientFormData) {
    const client: Client = {
      ...data,
      id: `client_${Date.now()}`,
    };

    clients.value.push(client);
    return client;
  }

  function updateClient(id: string, data: ClientFormData) {
    const index = clients.value.findIndex((client) => client.id === id);

    if (index !== -1) {
      clients.value[index] = { ...data, id };
    }
  }

  function deleteClient(id: string) {
    clients.value = clients.value.filter((client) => client.id !== id);
  }

  function getClientById(id: string) {
    return clients.value.find((client) => client.id === id);
  }

  return { clients, addClient, updateClient, deleteClient, getClientById };
});
