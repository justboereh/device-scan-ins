import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { Workbook } from 'exceljs'
import dayjs, { type Dayjs } from 'dayjs'

type Scan = {
  employee: string
  device: string
  scannedIn: Date
  scannedOut?: Date
}

export const useStorage = () => {
  return createStorage({
    driver: indexedDbDriver({ base: 'dsi:', dbName: 'device-scan-ins', storeName: 'scans' }),
  })
}

export const validateEmployeeId = (id: string) => {
  if (!id) return false
  if (id.length < 2) return false
  if (id.toLowerCase().slice(0, 1) !== 'f' && id.slice(0, 2) !== '88') return false
  if (/[\D+]/g.test(id.slice(1))) return false

  return true
}

export const FocusEmployeeInput = () => (document.querySelector('#employee-input') as HTMLInputElement).focus()
export const FocusDeviceInput = () => (document.querySelector('#device-input') as HTMLInputElement).focus()

export const SaveScansAsExcel = (scans: Scan[], date: Dayjs) => {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Scans')

  worksheet.columns = [
    { header: 'Employee ID', key: 'employee', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
    { header: 'Device ID', key: 'device', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
    { header: 'Scan In Date', key: 'scannedIn', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
    { header: 'Scan Out Date', key: 'scannedOut', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
  ]

  for (const scan of scans) {
    worksheet.addRow([
      scan.employee,
      scan.device,
      dayjs(scan.scannedIn).format('MMM DD, YYYY h:mm A'),
      scan.scannedOut ? dayjs(scan.scannedOut).format('MMM DD, YYYY h:mm A') : '',
    ])
  }

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scans-${date.format('MM-DD-YYYY')}.xlsx`
    a.click()
  })
}

export const SaveScansAsCsv = (scans: Scan[]) => {}
