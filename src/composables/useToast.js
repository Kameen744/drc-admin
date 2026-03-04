import { toast } from 'vue3-toastify'

export function useToast() {
  const showSuccess = (message) => {
    toast.success(message, {
      autoClose: 3000,
      position: 'top-right',
      theme: 'light',
    })
  }

  const showError = (message) => {
    toast.error(message, {
      autoClose: 3000,
      position: 'top-right',
      theme: 'light',
    })
  }

  return {
    showSuccess,
    showError
  }
}
