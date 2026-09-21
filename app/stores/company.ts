import { defineStore } from "pinia";
import type { CompanyFormData } from "@/schemas/company";

export type Company = CompanyFormData & { id: string };

export const useCompanyStore = defineStore("company", () => {
  const company = ref<Company>({
    id: "company_1",
    name: "WEBDAK Biz PR Osečina",
    shortName: "Webdak Biz",
    address: "Karađorđeva 126",
    place: "Osečina",
    postalCode: "14253",
    email: "info@webdak.rs",
    phone: "+381 677 20 4115",
    pib: "113456789",
    vatStatus: "vatOn",
    companyType: "pr",
    bankAccount: "160-0000000076543-21",
    mb: "22456789",
  });

  function updateCompany(data: CompanyFormData) {
    company.value = {
      ...data,
      id: company.value.id,
    };
  }

  return { company, updateCompany };
});
