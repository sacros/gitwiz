export const isValidPortNumber = val => {
  return Number.isInteger(val) && val < 65535 && val > 2000
}
