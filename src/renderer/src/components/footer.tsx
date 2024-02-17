import { AppShell, Container, ScrollArea, Stack, Group, ActionIcon } from '@mantine/core'
import { useInstallContext } from '@renderer/context/install.context'
import { FC } from 'react'
import { VscCloseAll } from 'react-icons/vsc'

export const Footer: FC = () => {
  const installContext = useInstallContext()
  return (
    <AppShell.Footer>
      <Container size="xs">
        <Group justify="space-between">
          {installContext && installContext.installStates && (
            <ScrollArea>
              <Stack gap="xs">
                {Object.keys(installContext.installStates).map((x) => (
                  <div key={x}>
                    {x}: {installContext.installStates && installContext.installStates[x]}
                  </div>
                ))}
              </Stack>
            </ScrollArea>
          )}
          {installContext &&
            installContext.installStates &&
            Object.keys(installContext.installStates).length > 0 && (
              <ActionIcon
                radius={0}
                size={'xs'}
                variant={'subtle'}
                onClick={installContext.clearProgress}
              >
                <VscCloseAll />
              </ActionIcon>
            )}
        </Group>
      </Container>
    </AppShell.Footer>
  )
}
