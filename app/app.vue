<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
const toaster = { position: "top-right" as const, max: 3 };
const route = useRoute();

const dateTime = useDateFormat(useNow(), "dddd DD. MMMM YYYY. HH:mm", {
  locales: "sr-Latn-RS",
});

const dateTimeMobile = useDateFormat(useNow(), "ddd DD.MM.YY. HH:mm", {
  locales: "sr-Latn-RS",
});

const isDesktop = useIsDesktop();

const sidebarOpen = ref(isDesktop.value);

watch(isDesktop, (desktop) => {
  sidebarOpen.value = desktop;
});

watch(
  () => route.fullPath,
  () => {
    if (!isDesktop.value) {
      sidebarOpen.value = false;
    }
  },
);

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Početna",
    icon: "i-lucide-house",
    active: route.path === "/",
    to: "/",
  },
  {
    label: "Dokumenti",
    icon: "i-lucide-file",
    active: route.path.startsWith("/invoices"),
    to: "/invoices",
  },
  {
    label: "Klijenti",
    icon: "i-lucide-users",
    active: route.path.startsWith("/clients"),
    to: "/clients",
    badge: "4",
    chip: {
      color: "success",
      // size: "3xl",
      // text: 1,
    },
  },
  {
    label: "Proizvodi i usluge",
    icon: "i-lucide-package",
    active: route.path.startsWith("/items"),
    to: "/items",
  },
  {
    label: "Zaposleni",
    icon: "gravity-ui:person-worker",
    active: route.path.startsWith("/sdf"),
    to: "/",
  },
  {
    label: "Moja firma",
    icon: "i-lucide-building-2",
    active: route.path.startsWith("/company"),
    to: "/company",
  },
  {
    label: "Postavke",
    icon: "lucide:settings-2",
    active: route.path.startsWith("/sdf"),
    to: "/",
  },
]);

const user = ref({
  name: "David Pantelić",
  avatar: {
    src: "https://avatars.githubusercontent.com/u/28558542?v=4",
    alt: "David Pantelic",
  },
});

const colorMode = useColorMode();

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Profil",
      icon: "i-lucide-user",
    },
    // {
    //   label: "Billing",
    //   icon: "i-lucide-credit-card",
    // },
    {
      label: "Podešavanja",
      icon: "i-lucide-settings",
      to: "/login",
    },
  ],
  [
    {
      label: "Izgled",
      icon: "i-lucide-sun-moon",
      // ui: {
      //   content: "w-60 min-w-40",
      // },
      content: isDesktop.value
        ? { side: "right", align: "start", sideOffset: 7 }
        : { side: "bottom", align: "center", sideOffset: 4 },
      children: [
        {
          label: "Svetlo",
          icon: "i-lucide-sun",
          type: "checkbox",
          ui: {
            item: "cursor-pointer",
          },
          checked: colorMode.value === "light",
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = "light";
            }
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
        {
          label: "Tamno",
          icon: "i-lucide-moon",
          type: "checkbox",
          ui: {
            item: "cursor-pointer",
          },
          checked: colorMode.value === "dark",
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = "dark";
            }
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
      ],
    },
  ],
  [
    {
      label: "Pomoć",
      icon: "lucide:circle-question-mark",
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
    {
      label: "Odjavi se",
      icon: "i-lucide-log-out",
    },
  ],
]);
</script>

<template>
  <NuxtPwaAssets />

  <UApp :toaster="toaster">
    <div class="flex flex-1">
      <USidebar
        v-model:open="sidebarOpen"
        collapsible="icon"
        :side="isDesktop ? 'left' : 'right'"
        :style="{ '--sidebar-width-icon': '76px' }"
      >
        <template #header>
          <div class="flex justify-between gap-1 w-full overflow-hidden">
            <div class="flex items-center gap-5 shrink-0">
              <UIcon name="i-logos-nuxt-icon" class="size-10 shrink-0" />
              <span class="leading-none">Webdak Biz</span>
            </div>
            <UButton
              :icon="
                isDesktop
                  ? 'i-lucide-panel-left-close'
                  : 'i-lucide-panel-right-close'
              "
              color="neutral"
              variant="ghost"
              aria-label="Toggle sidebar"
              class="flex lg:hidden"
              @click="
                () => {
                  sidebarOpen = false;
                }
              "
            />
          </div>
        </template>

        <template #footer>
          <UDropdownMenu
            :items="userItems"
            :content="{ align: 'center', collisionPadding: 12 }"
            :ui="{
              content:
                'w-(--reka-dropdown-menu-trigger-width) min-w-48 transition-none',
              item: 'items-center transition-none before:transition-none',
              itemLeadingIcon: 'transition-none',
            }"
          >
            <UButton
              v-bind="user"
              :label="user?.name"
              trailing-icon="i-lucide-chevrons-up-down"
              color="neutral"
              variant="ghost"
              size="xl"
              square
              class="w-full data-[state=open]:bg-elevated overflow-hidden"
              :ui="{
                trailingIcon: 'text-dimmed ms-auto',
              }"
            />
          </UDropdownMenu>
        </template>

        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{
            link: 'p-2 my-1 overflow-hidden',
            linkLeadingIcon: 'size-6 sm:size-7',
          }"
        />
      </USidebar>

      <div
        class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default"
      >
        <div
          class="h-(--ui-header-height) right-0 shrink-0 flex gap-2 sm:gap-5 items-center px-4 border-b border-default"
        >
          <UButton
            v-if="isDesktop"
            :icon="
              sidebarOpen
                ? 'i-lucide-panel-left-close'
                : 'i-lucide-panel-left-open'
            "
            color="neutral"
            variant="ghost"
            aria-label="Toggle sidebar"
            @click="
              () => {
                sidebarOpen = !sidebarOpen;
              }
            "
          />
          <div class="w-full flex items-center justify-between leading-none">
            <span class="text-xl sm:text-2xl">Webdak</span>
            <span class="hidden sm:inline">{{ dateTime }}</span>
            <span class="sm:hidden">{{ dateTimeMobile }}</span>
          </div>

          <div v-if="!isDesktop" class="flex gap-1">
            <UButton
              icon="i-lucide-house"
              color="neutral"
              variant="ghost"
              aria-label="Homepage"
              class="flex lg:hidden"
              to="/"
            />
            <UButton
              :icon="
                sidebarOpen
                  ? 'i-lucide-panel-right-close'
                  : 'i-lucide-panel-right-open'
              "
              color="neutral"
              variant="ghost"
              aria-label="Toggle sidebar"
              @click="
                () => {
                  sidebarOpen = !sidebarOpen;
                }
              "
            />
          </div>
        </div>

        <UMain
          class="flex max-h-[calc(100vh-var(--ui-header-height))] flex-1 flex-col items-center justify-center"
        >
          <NuxtPage
            class="overflow-y-auto w-full h-full scrollbar-gutter-both px-3 py-4 sm:py-8"
          />
        </UMain>
      </div>
    </div>

    <!-- <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #default>
        <p class="text-sm text-muted">
          Webdak • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter> -->
  </UApp>
</template>
