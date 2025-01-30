import { showNotification } from '@mantine/notifications'

export interface ErrorWithDetails extends Error {
  title?: string
}

export const showErrorNotification = (error: ErrorWithDetails) => {
  if (error.message.startsWith('EPERM')) {
    error.message = `NOT RUNNING IN ADMIN! Running in admin is required for this feature. \n\r ${error.message}`
  }
  showNotification({
    color: 'red',
    title: error.title || 'Error',
    message: error.message,
    autoClose: 60000
  })
}

export const showSuccessNotification = (message: string) => {
  showNotification({ color: 'green', title: 'Success', message })
}
