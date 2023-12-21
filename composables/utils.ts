import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'

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
