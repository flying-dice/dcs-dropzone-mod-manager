import React, { FC } from 'react'
import { ActionIcon, Anchor, Code, Divider, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { GhIntegrationCard } from '../container/gh-integration-card'
import { VscGistSecret, VscQuestion } from 'react-icons/vsc'
import { useLocalStorage } from '@mantine/hooks'
import { useGhUser } from '../context/gh-user.context'
import { useGetRegistryIndex } from '../../../client'
import { useSettings } from '../context/settings.context'

const Info: FC<{ opened: boolean; onClose: () => void }> = ({ opened, onClose }) => {
  return (
    <Modal
      opened={opened}
      variant={'default'}
      withCloseButton
      onClose={onClose}
      title={<Title order={3}>Integrations</Title>}
      size={'xl'}
    >
      <Stack>
        <Text>
          Integrations allow you to update your mods directly from github releases via webhooks, see
          the{' '}
          <Anchor
            href={
              'https://github.com/flying-dice/dcs-dropzone-registry/blob/develop/README.md#github-integration'
            }
            target={'_blank'}
          >
            docs
          </Anchor>{' '}
          for more info.
        </Text>
        <Divider />
        <Text>
          To have a mod appear in this list it should have your github username in the admins list
          in the <Code>index.md</Code>, you can copy your github username from the profile menu.
        </Text>

        <Text>
          Once you have added your username to the admins list, you can generate a webhook token by
          clicking the copy token icon (<VscGistSecret />) in the mod card.
        </Text>
      </Stack>
    </Modal>
  )
}

export type IntegrationsPageProps = {}
export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({}) => {
  const [showInfo, setShowInfo] = useLocalStorage({ key: 'integrations-info', defaultValue: false })
  const settings = useSettings()
  const registryIndex = useGetRegistryIndex({ axios: { baseURL: settings.registryUrl } })
  const { user } = useGhUser()

  return (
    <Stack>
      <Stack gap={'xs'}>
        <Stack gap={0}>
          <Group gap={2} justify={'space-between'}>
            <Title order={3}>Integrations</Title>
            <ActionIcon variant={'default'} onClick={() => setShowInfo(!showInfo)}>
              <VscQuestion size={14} />
            </ActionIcon>
          </Group>
        </Stack>
        <Info onClose={() => setShowInfo(false)} opened={showInfo} />
      </Stack>
      <Stack>
        {registryIndex.data?.data
          .filter((it) => user?.login && it.integration?.admins.includes(user.login))
          .map((it) => <GhIntegrationCard key={it.id} item={it} />)}
      </Stack>
    </Stack>
  )
}
