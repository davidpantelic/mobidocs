<script lang="ts" setup>
const props = defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <div class="flex gap-2 items-center justify-center mb-5">
    <UIcon :name="props.icon" class="size-5" />
    <h1>{{ props.title }}</h1>
  </div>
</template>
