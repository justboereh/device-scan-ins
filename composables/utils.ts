import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'

export const useStorage = () => {
  return createStorage({
    driver: indexedDbDriver({ base: 'desiin:' }),
  })
}

export const validateEmployeeId = (id: string) => {
  if (!id) return false
  if (id.length < 2) return false
  if (id.toLowerCase().charAt(0) !== 'f' || id.slice(0, 2) !== '88') return false
  if (/[\D+]/g.test(id.slice(1))) return false

  return true
}

export const focusEmployeeInput = () => {
  const input = document.querySelector('#employee-input input') as HTMLInputElement

  input.focus()
}

export const focusDeviceInput = () => {
  const input = document.querySelector('#device-input input') as HTMLInputElement

  input.focus()
}
