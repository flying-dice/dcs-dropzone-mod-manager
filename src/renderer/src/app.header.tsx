import React from 'react'
import { AppShell, Divider, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import bytes from 'bytes'
import { useRclone } from './hooks/useRclone'

export type AppHeaderProps = {}
export const AppHeader: React.FC<AppHeaderProps> = ({}) => {
  const theme = useMantineTheme()
  const { stats } = useRclone()

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
          <Stack gap={2} pr={'md'}>
            <Group gap={4}>
              <Title order={6}>Bytes Transferred:</Title>
              <Text size={'sm'}>{bytes(stats.data?.bytes || 0)}</Text>
            </Group>

            <Group gap={4}>
              <Title order={6}>Average Speed:</Title>
              <Text size={'sm'}>{bytes(stats.data?.speed || 0)}/s</Text>
            </Group>
          </Stack>
        </Group>
      </Stack>
    </AppShell.Header>
  )
}
