import { ActionIcon, Stack, Tooltip } from '@mantine/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export type AppNavItem = {
  path: string
  tooltip: string
  icon: React.ReactNode
  isExternal?: boolean
}
export type AppNavProps = {
  items: AppNavItem[]
}
export const AppNav: React.FC<AppNavProps> = ({ items }) => {
  const navigate = useNavigate()
  return (
    <Stack gap={0}>
      {items.map(({ path, icon, tooltip, isExternal }) => (
        <Tooltip key={path} label={tooltip} openDelay={500}>
          {isExternal ? (
            <ActionIcon component="a" href={path} radius={0} size={'xl'} variant={'subtle'}>
              {icon}
            </ActionIcon>
          ) : (
            <ActionIcon radius={0} size={'xl'} variant={'subtle'} onClick={() => navigate(path)}>
              {icon}
            </ActionIcon>
          )}
        </Tooltip>
      ))}
    </Stack>
  )
}
