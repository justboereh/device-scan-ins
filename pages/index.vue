<script setup lang="ts">
import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

type Scan = {
  employee: number
  device: string
  scanIn: Date
  scanOut: Date
}

const date = ref(new Date())
const scans = ref<Scan[]>([])

function useStorage() {
  return createStorage({
    driver: indexedDbDriver({ base: 'desiin:' }),
  })
}

watch(scans, async (v) => {
  await useStorage().setItem('scans', v)
})

onMounted(async () => (scans.value = (await useStorage().getItem<Scan[]>('scans')) || []))

defineComponent({
  components: {
    DatePicker,
  },
})
</script>

<template>
  <main class="fixed top-0 left-0 right-0 bottom-0 grid place-items-center py-16">
    <div class="w-full max-w-5xl flex max-h-2xl h-full border border-light-700 bg-white rounded-xl shadow-lg shadow-black/20">
      <div class="h-full grid place-items-center border-r p-4">
        <date-picker
          v-model="date"
          ref="calender"
          expanded
          is-required
          :borderless="true"
        >
          <template #footer>
            <div class="w-full px-4 pb-3">
              <button
                class="bg-blue-700 hover:bg-blue-900 transition-all duration-200 text-white font-bold w-full px-3 py-1 rounded-sm"
                @click="date = new Date()"
              >
                Today
              </button>
            </div>
          </template>
        </date-picker>
      </div>

      <div class="flex-grow p-4">hi</div>
    </div>
  </main>
</template>

<style>
body {
  @apply bg-light-400;
}
</style>
