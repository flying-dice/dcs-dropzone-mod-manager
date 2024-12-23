import { ActionIcon, ActionIconVariant, Stack, Tooltip } from '@mantine/core'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function AppNavItemComponent({ icon, tooltip, isExternal, path }: AppNavItem) {
  const location = useLocation()
  const navigate = useNavigate()

  const variant: ActionIconVariant = location.pathname === path ? 'light' : 'subtle'

  return (
    <Tooltip key={path} label={tooltip} openDelay={500}>
      {isExternal ? (
        <ActionIcon radius={0} component="a" href={path} size={'xl'} variant={variant}>
          {icon}
        </ActionIcon>
      ) : (
        <ActionIcon radius={0} size={'xl'} variant={variant} onClick={() => navigate(path)}>
          {icon}
        </ActionIcon>
      )}
    </Tooltip>
  )
}

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
  return (
    <Stack gap={0}>
      {items.map(({ path, icon, tooltip, isExternal }) => (
        <AppNavItemComponent
          key={path}
          path={path}
          icon={icon}
          tooltip={tooltip}
          isExternal={isExternal}
        />
      ))}
    </Stack>
  )
}
