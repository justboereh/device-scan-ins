<script setup lang="ts">
import { DatePicker } from 'v-calendar'
import { InputBox } from '#components'
import 'v-calendar/style.css'

type Scan = {
  employee: string
  device: string
  scannedIn: Date
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
const scanList = ref<ScanList[]>([])
const identifiers = reactive({
  device: '',
  employee: '',
})
const Dialog = reactive({
  enabled: false,
  title: '',
  ok: () => {},
  message: '',
})
const scans = computed(() => {
  const d = date.value

  if (!d) return []

  let list = scanList.value.find((s) => s.date.toDateString() === d.toDateString())

  if (!list) {
    const l = scanList.value.push({ date: d, scans: [] })

    list = scanList.value[l - 1]
  }

  return list.scans
})

function getScanListIndex(date: Date) {
  return scanList.value.findIndex((s) => s.date.toDateString() === date.toDateString())
}

function insertScan(scan: Scan) {
  if (!date.value) return useDialog({ title: 'Date is required', message: 'Please select a date first' })

  const listIndex = getScanListIndex(date.value)
  const lastScans = scans.value
  const scanIndex = lastScans.findIndex((s) => s.device === scan.device && s.employee === scan.employee)
}

function isScannedIn(option: IsScannedOption) {
  if ('employee' in option) {
    return scans.value.findIndex((s) => s.employee === option.employee && s.scannedIn) !== -1
  }

  return scans.value.findIndex((s) => s.device === option.device && s.scannedIn) !== -1
}

function isScannedOut(option: IsScannedOption) {
  if ('employee' in option) {
    return scans.value.some((s) => s.employee === option.employee && s.scannedOut)
  }

  return scans.value.some((s) => s.device === option.device && s.scannedOut)
}

function Scanned() {
  if (!date.value) {
    return useDialog({
      title: 'Date is required',
      message: 'Please select a date first before scanning',
    })
  }

  if (identifiers.employee && !validateEmployeeId(identifiers.employee)) {
    identifiers.employee = ''

    return useDialog({
      title: 'Invalid employee ID',
      message: 'Please enter a valid employee ID',
      ok: focusEmployeeInput,
    })
  }

  if (identifiers.employee && isScannedOut({ employee: identifiers.employee, date: date.value })) {
    identifiers.employee = ''

    return useDialog({
      title: 'Already scanned out',
      message: 'This employee is already scanned out',
      ok: focusEmployeeInput,
    })
  }

  if (identifiers.employee && isScannedIn({ employee: identifiers.employee, date: date.value })) {
    // TODO: Scan out employee

    return
  }

  if (identifiers.employee && !identifiers.device) return focusDeviceInput()

  if (identifiers.device && isScannedOut({ device: identifiers.device, date: date.value })) {
    identifiers.device = ''

    return useDialog({
      title: 'Already scanned out',
      message: 'This device is already scanned out',
      ok: focusDeviceInput,
    })
  }

  if (identifiers.device && isScannedIn({ device: identifiers.device, date: date.value })) {
    // TODO: Scan out device

    return
  }

  if (identifiers.device && !identifiers.employee) return focusEmployeeInput()

  // TODO Scan in device and employee
}

function useDialog({ title, message, ok }: { title: string; message: string; ok?: () => void }) {
  Dialog.title = title
  Dialog.message = message
  Dialog.ok = ok || (() => {})
  Dialog.enabled = true
}

watch(scanList, async (v) => {
  await useStorage().setItem('scans', v)
})

onMounted(async () => {
  date.value = new Date()
  scanList.value = (await useStorage().getItem<ScanList[]>('scans')) || []

  loading.value = false
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
          color="red"
          expanded
          is-required
          borderless
          transparent
        >
          <template #footer>
            <div class="w-full px-3 pb-3">
              <button
                class="bg-red-700 hover:bg-red-900 transition-all duration-200 text-white font-bold w-full px-3 py-1 rounded-sm"
                @click="date = new Date()"
              >
                Today
              </button>
            </div>
          </template>
        </date-picker>
      </div>

      {{ identifiers.employee }}

      <div class="flex-grow flex flex-col gap-3">
        <div class="flex <sm:flex-col gap-3">
          <input-box
            id="employee-input"
            v-model="identifiers.employee"
            label="Employee ID"
            class="flex-grow"
            @submit="Scanned"
          />

          <input-box
            ref="device-input"
            v-model="identifiers.device"
            label="Device ID"
            class="flex-grow"
            @submit="Scanned"
          />
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
          class="bg-red-700 hover:bg-red-900 transition-all duration-200 text-white px-3 py-1 rounded-md w-full"
          @click=";(Dialog.enabled = false), Dialog.ok()"
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
