<script setup lang="ts">
import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { DatePicker } from 'v-calendar'
import { InputBox } from '#components'
import 'v-calendar/style.css'

type Scan = {
  employee: string
  device: string
  scannedIn?: Date
  scannedOut?: Date
}

type ScanList = {
  date: Date
  scans: Scan[]
}

type IsScannedOption =
  | {
      employee: string
      date: Date
    }
  | {
      device: string
      date: Date
    }

const loading = ref(true)
const date = ref<Date>()
const scans = ref<ScanList[]>([])
const identifier = ref('')
const Dialog = reactive({
  enabled: false,
  title: '',
  message: '',
})

function useStorage() {
  return createStorage({
    driver: indexedDbDriver({ base: 'desiin:' }),
  })
}

function getScanList(date: Date) {
  let list = scans.value.find((s) => s.date.toDateString() === date.toDateString())

  if (!list) {
    const l = scans.value.push({ date, scans: [] })

    list = scans.value[l - 1]
  }

  return list
}

function isScannedIn(option: IsScannedOption) {
  const list = getScanList(option.date)

  if ('employee' in option) {
    return list.scans.some((s) => s.employee === option.employee && s.scannedIn)
  }

  return list.scans.findIndex((s) => s.device === option.device && s.scannedIn)
}

function isScannedOut(option: IsScannedOption) {
  const list = getScanList(option.date)

  if ('employee' in option) {
    return list.scans.some((s) => s.employee === option.employee && s.scannedOut)
  }

  return list.scans.some((s) => s.device === option.device && s.scannedOut)
}

function Scanned() {
  if (!date.value) {
    identifier.value = ''

    return useDialog({
      title: 'Date is required',
      message: 'Please select a date first before scanning',
    })
  }

  const id = identifier.value.trim()

  if (!id) {
    identifier.value = ''

    return useDialog({
      title: 'Identifier is required',
      message: 'Please enter a device or employee ID',
    })
  }

  if (id.toLowerCase().charAt(0) === 'f') {
    const scannedIn = isScannedIn({ employee: id, date: date.value })
    const scannedOut = isScannedOut({ employee: id, date: date.value })

    identifier.value = ''

    return useDialog({
      title: 'Already scanned',
      message: 'This employee is already scanned',
    })
  }
}

function useDialog({ title, message }: { title: string; message: string }) {
  Dialog.title = title
  Dialog.message = message
  Dialog.enabled = true
}

watch(scans, async (v) => {
  await useStorage().setItem('scans', v)
})

onMounted(async () => {
  date.value = new Date()
  scans.value = (await useStorage().getItem<ScanList[]>('scans')) || []

  setTimeout(() => (loading.value = false), 1500)
})

defineComponent({
  components: {
    DatePicker,
  },
})

useHead({
  title: 'Device Scans',
  bodyAttrs: {
    class: 'bg-light-400',
  },
})
</script>

<template>
  <main class="fixed top-0 left-0 right-0 bottom-0 grid place-items-center p-3 md:py-16">
    <div class="w-full max-w-5xl flex <md:flex-col md:gap-8 h-full">
      <div class="md:h-full grid place-items-center md:p-4">
        <date-picker
          v-model="date"
          ref="calender"
          expanded
          is-required
          borderless
          transparent
        >
          <template #footer>
            <div class="w-full px-3 pb-3">
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

      <div class="flex-grow flex flex-col gap-3">
        <div class="flex <sm:flex-col gap-3">
          <input-box
            v-model="identifier"
            label="Device/Employee ID"
            @submit="Scanned"
          />

          <!-- <input-box
            ref="deviceEl"
            v-model="inputs.device"
            label="Device ID"
            @submit="Scanned('device')"
          /> -->
        </div>

        <div class="flex-grow p-4 border border-light-700 bg-white rounded-xl shadow-xl shadow-black/5">hi</div>
      </div>
    </div>
  </main>

  <div
    v-if="Dialog.enabled"
    class="bg-black/25 backdrop-blur-sm z-10 fixed z-100 top-0 left-0 right-0 bottom-0 grid place-items-center"
  >
    <div class="p-4 bg-white rounded-lg">
      <h1 class="text-xl font-bold">{{ Dialog.title }}</h1>
      <p class="text-black/75">{{ Dialog.message }}</p>

      <div class="flex gap-3 mt-4">
        <button
          class="bg-blue-700 hover:bg-blue-900 transition-all duration-200 text-white px-3 py-1 rounded-s"
          @click="Dialog.enabled = false"
        >
          OK
        </button>
      </div>
    </div>
  </div>

  <div
    :class="[
      'fixed z-100 top-0 left-0 right-0 bottom-0 flex items-center justify-center gap-1.5',
      loading ? 'bg-black/50 backdrop-blur-sm' : 'pointer-events-none opacity-0',
    ]"
  >
    <div
      v-for="index of 4"
      class="w-4 h-4"
    >
      <span
        class="w-full h-full bg-red-500 rounded-full block"
        :style="{ animation: 'pulsier 1s infinite ease-in-out', animationDelay: `${index * 200}ms` }"
      />
    </div>
  </div>
</template>

<style>
@keyframes pulsier {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
</style>
