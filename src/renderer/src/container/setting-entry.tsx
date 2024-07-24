import { Combobox, TextInput } from '@mantine/core'
import type React, { ReactNode } from 'react'
import { useConfig } from '../hooks/useConfig'
import ClearButton = Combobox.ClearButton

export type SettingEntryProps = {
  name: string
  label: ReactNode
  description: ReactNode
  defaultValue?: string
  onClick: () => void
  disabled?: boolean
}
export const SettingEntry: React.FC<SettingEntryProps> = ({
  name,
  label,
  description,
  defaultValue,
  onClick,
  disabled
}) => {
  const config = useConfig(name)

  return (
    <TextInput
      key={config.value.data?.value}
      label={label}
      description={description}
      readOnly
      placeholder={defaultValue}
      value={config.value.data?.value}
      onClick={onClick}
      styles={{ input: { cursor: 'pointer' } }}
      rightSection={<ClearButton onClear={() => config.clear()} />}
      disabled={disabled || config.value.isLoading || config.value.error}
    />
  )
}
