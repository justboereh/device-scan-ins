<script setup lang="ts">
type Props = {
  enabled: boolean
  title: string
  message: string
  ok: () => void
}

const props = defineProps<Props>()
const emit = defineEmits(['update:enabled'])
</script>

<template>
  <div
    v-if="enabled"
    class="bg-black/25 backdrop-blur-sm z-10 fixed z-100 top-0 left-0 right-0 bottom-0 grid place-items-center"
  >
    <div class="p-4 bg-white rounded-sm min-w-sm max-w-full max-h-full">
      <h1 class="text-xl font-bold">{{ title }}</h1>
      <p class="text-black/75">{{ message }}</p>

      <div class="flex gap-3 mt-4">
        <button
          class="bg-red-500 hover:bg-red-700 transition-all duration-200 text-white px-3 py-1 rounded-sm w-full"
          @click="$emit('update:enabled', false), ok()"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>
