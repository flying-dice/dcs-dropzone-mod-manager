import { AppShell, Divider, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import React from 'react'

export type AppHeaderProps = {}
export const AppHeader: React.FC<AppHeaderProps> = ({}) => {
  const theme = useMantineTheme()

  return (
    <AppShell.Header style={{ background: theme.colors.dark[8] }}>
      <Stack pl={'md'} h={'100%'} justify={'center'}>
        <Group justify={'space-between'}>
          <Group>
            <Text
              style={{
                fontSize: 'xx-large',
                fontFamily: 'Doctor Glitch',
                color: '#f59e0f'
              }}
            >
              Dropzone
            </Text>
            <Divider orientation={'vertical'} />
            <Text
              style={{
                fontFamily: 'Montserrat',
                width: 250
              }}
            >
              Community Mod Manager for DCS World
            </Text>
          </Group>
        </Group>
      </Stack>
    </AppShell.Header>
  )
}
