import { showNotification } from '@mantine/notifications'

export interface ErrorWithDetails extends Error {
  title?: string
}

export const showErrorNotification = (error: ErrorWithDetails) => {
  showNotification({ color: 'red', title: error.title || 'Error', message: error.message })
}

export const showSuccessNotification = (message: string) => {
  showNotification({ color: 'green', title: 'Success', message })
}
