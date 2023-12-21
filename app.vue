<script setup lang="ts">
import { watchIgnorable } from '@vueuse/core'
import dayjs, { Dayjs } from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import { message } from 'ant-design-vue'

import 'v-calendar/style.css'

dayjs.extend(utcPlugin)

type Scan = {
  employee: string
  device: string
  scannedIn: Date
  scannedOut?: Date
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

const [useMessage, contextHolder] = message.useMessage()
const clearDataModalEnabled = ref(false)
const loading = ref(false)
const date = ref<Dayjs>()
const identifiers = reactive({
  device: '',
  employee: '',
})
const dialog = reactive({
  enabled: false,
  title: '',
  ok: () => {},
  message: '',
})
const scans = ref<Scan[]>([])
const scanIns = computed(() => scans.value.filter((s) => !s.scannedOut))
const scanOuts = computed(() => scans.value.filter((s) => !!s.scannedOut))
const DateFormat = () => dayjs(date.value).format('MM-DD-YYYY')

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

function ScanOut(index: number) {
  const scan = scans.value[index]
  scan.scannedOut = new Date()

  scans.value = [...scans.value.slice(0, index), scan, ...scans.value.slice(index + 1)]

  identifiers.employee = ''
  identifiers.device = ''
}

function Scanned() {
  if (!date.value) {
    return useMessage.error('Please select a date first before scanning')
  }

  if (!identifiers.employee && !identifiers.device) return

  if (identifiers.employee && !validateEmployeeId(identifiers.employee)) {
    identifiers.employee = ''
    FocusEmployeeInput()

    return useMessage.error('Please enter a valid employee ID')
  }

  if (identifiers.employee && isScannedOut({ employee: identifiers.employee, date: date.value.toDate() })) {
    identifiers.employee = ''
    FocusEmployeeInput()

    return useMessage.error('This employee is already scanned out')
  }

  if (identifiers.employee && isScannedIn({ employee: identifiers.employee, date: date.value.toDate() })) {
    const index = scans.value.findIndex((s) => s.employee === identifiers.employee && s.scannedIn)

    useMessage.success('Scanned out successfully')
    return ScanOut(index)
  }

  if (identifiers.employee && !identifiers.device) return FocusDeviceInput()

  if (identifiers.device && isScannedOut({ device: identifiers.device, date: date.value.toDate() })) {
    identifiers.device = ''
    FocusDeviceInput()

    return useMessage.error('This device is already scanned out')
  }

  if (identifiers.device && isScannedIn({ device: identifiers.device, date: date.value.toDate() })) {
    const index = scans.value.findIndex((s) => s.device === identifiers.device && s.scannedIn)

    useMessage.success('Scanned out successfully')
    return ScanOut(index)
  }

  if (identifiers.device && !identifiers.employee) return FocusEmployeeInput()

  scans.value = [
    {
      employee: identifiers.employee,
      device: identifiers.device,
      scannedIn: new Date(),
    },
    ...scans.value,
  ]

  useMessage.success('Scanned successfully')

  identifiers.employee = ''
  identifiers.device = ''
  FocusEmployeeInput()
}

function ClearData() {
  useStorage().removeItem(`scans::${DateFormat()}`)
  scans.value = []
  clearDataModalEnabled.value = false
}

function SaveScans(as: 'excel' | 'csv') {
  if (!date.value) return useMessage.error('Please select a date first before saving')

  if (as === 'excel') SaveScansAsExcel(scans.value, date.value)
  else SaveScansAsCSV(scans.value, date.value)
}

onMounted(async () => (date.value = dayjs().startOf('day')))

const { ignoreUpdates: IgnoreScansUpdates } = watchIgnorable(scans, (s) => useStorage().setItem(`scans::${DateFormat()}`, s))

watch(date, () => {
  IgnoreScansUpdates(async () => {
    scans.value = (await useStorage().getItem(`scans::${DateFormat()}`)) || []
  })
})

useHead({
  title: 'Device Scans',
  bodyAttrs: {
    class: 'bg-light-400',
  },
})
</script>

<template>
  <a-config-provider
    :theme="{
      components: {},
    }"
  >
    <header class="py-3 px-3 sm:px-6 bg-white rounded-sm">
      <a-flex
        :justify="'space-between'"
        class="mx-auto max-w-5xl"
      >
        <a-date-picker
          v-model:value="date"
          placeholder="Choose a date"
        />

        <a-dropdown>
          <a-button type="text">
            <template #icon>
              <icon name="fluent:line-horizontal-3-20-regular" />
            </template>
          </a-button>

          <template #overlay>
            <a-menu>
              <a-menu-item
                :disabled="!date"
                @click="SaveScans('excel')"
              >
                Save as Excel
              </a-menu-item>
              <a-menu-item
                :disabled="!date"
                @click="SaveScans('csv')"
              >
                Save as CSV
              </a-menu-item>

              <a-menu-divider />

              <a-menu-item>Import Excel </a-menu-item>
              <a-menu-item>Import CSV </a-menu-item>

              <a-menu-divider />

              <a-menu-item>Import Excel to here </a-menu-item>
              <a-menu-item>Import CSV to here </a-menu-item>

              <a-menu-divider />

              <a-menu-item
                danger
                @click="clearDataModalEnabled = true"
                >Clear data
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-flex>
    </header>

    <main class="p-3 sm:p-6">
      <div class="mx-auto max-w-5xl">
        <div class="pb-3 sm:pb-6">
          <a-space size="small">
            <a-input
              id="employee-input"
              v-model:value="identifiers.employee"
              placeholder="Employee ID"
              @pressEnter="Scanned"
            />

            <a-input
              id="device-input"
              v-model:value="identifiers.device"
              placeholder="Device ID"
              @pressEnter="Scanned"
            />
          </a-space>
        </div>

        <a-table
          :pagination="false"
          :data-source="scans"
          :scroll="{ x: 'max-content' }"
          :columns="[
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              filters: [
                {
                  text: 'Scanned In',
                  value: 'scannedIn',
                },
                {
                  text: 'Scanned Out',
                  value: 'scannedOut',
                },
              ],
            },
            {
              title: 'Employee ID',
              dataIndex: 'employee',
              key: 'employee',
            },
            {
              title: 'Device ID',
              dataIndex: 'device',
              key: 'device',
            },
            {
              title: 'Scanned In',
              dataIndex: 'scannedIn',
              key: 'scannedIn',
            },
            {
              title: 'Scanned Out',
              dataIndex: 'scannedOut',
              key: 'scannedOut',
            },
          ]"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'scannedIn'">
              {{ dayjs(record['scannedIn']).format('MMM DD, YYYY h:mm:ss A') }}
            </template>

            <template v-else-if="column.key === 'scannedOut'">
              {{ record['scannedOut'] ? dayjs(record['scannedOut']).format('MMM DD, YYYY h:mm:ss A') : '' }}
            </template>
          </template>
        </a-table>
      </div>
    </main>

    <client-only>
      <context-holder />
    </client-only>

    <a-modal
      v-model:open="clearDataModalEnabled"
      title="Clear Data"
      cancel-text="Confirm"
      :cancel-button-props="{
        danger: true,
        type: 'text',
      }"
      ok-text="Cancel"
      @cancel="ClearData"
      @ok="clearDataModalEnabled = false"
    >
      <p>Are you sure you want to clear the data? This action is irreversible.</p>
    </a-modal>
  </a-config-provider>
</template>
