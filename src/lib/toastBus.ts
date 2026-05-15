type ShowToastFn = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void

let showToastFn: ShowToastFn | null = null

export function setShowToast(fn: ShowToastFn) {
  showToastFn = fn
}

export function showToast(message: string, type?: 'success' | 'error' | 'info' | 'warning') {
  showToastFn?.(message, type)
}
