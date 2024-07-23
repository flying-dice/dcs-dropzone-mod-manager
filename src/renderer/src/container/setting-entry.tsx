import React, { ReactNode } from 'react'
import { useConfig } from '../hooks/useConfig'
import { Combobox, TextInput } from '@mantine/core'
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
      key={config.value.data?.lastModified}
      label={label}
      description={description}
      readOnly
      placeholder={defaultValue}
      value={config.value.data?.value}
      onClick={onClick}
      styles={{ input: { cursor: 'pointer' } }}
      rightSection={<ClearButton onClear={() => config.clear()} />}
      disabled={disabled}
    />
  )
}
