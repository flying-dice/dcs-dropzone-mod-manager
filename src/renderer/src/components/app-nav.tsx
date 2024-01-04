import React, { ReactNode } from 'react'
import { ActionIcon, Stack, Tooltip } from '@mantine/core'
import { useNavigate } from 'react-router-dom'

export type AppNavItem = {
  path: string
  tooltip: string
  icon: ReactNode
}
export type AppNavProps = {
  items: AppNavItem[]
}
export const AppNav: React.FC<AppNavProps> = ({ items }) => {
  const navigate = useNavigate()
  return (
    <Stack gap={0}>
      {items.map(({ path, icon, tooltip }) => (
        <Tooltip key={path} label={tooltip} openDelay={500}>
          <ActionIcon radius={0} size={'xl'} variant={'subtle'} onClick={() => navigate(path)}>
            {icon}
          </ActionIcon>
        </Tooltip>
      ))}
    </Stack>
  )
}
