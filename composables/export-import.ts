import ExcelJS from 'exceljs'
import dayjs, { type Dayjs } from 'dayjs'

type Scan = {
  employee: string
  device: string
  scannedIn: Date
  scannedOut?: Date
}

/** Excel */
export const SaveScansAsExcel = (scans: Scan[], date: Dayjs) => {
  const name = `scans-${date.format('MM-DD-YYYY')}.xlsx`
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(name)

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
    a.download = name
    a.click()
  })
}

/** CSV */
export const SaveScansAsCSV = (scans: Scan[], date: Dayjs) => {
  const name = `scans-${date.format('MM-DD-YYYY')}.csv`
  const csv = [
    ['Employee ID', 'Device ID', 'Scan In Date', 'Scan Out Date'].join(','),
    ...scans.map((scan) => [
      scan.employee,
      scan.device,
      `"${dayjs(scan.scannedIn).format('MMM DD, YYYY h:mm A')}"`,
      scan.scannedOut ? `"${dayjs(scan.scannedOut).format('MMM DD, YYYY h:mm A')}"` : '',
    ]),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
}
