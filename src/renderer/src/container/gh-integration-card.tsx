import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip
} from '@mantine/core'
import { AiOutlineGithub } from 'react-icons/ai'
import { useClipboard } from '@mantine/hooks'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { RegistryIndexItem, useGetRegistryEntry } from '../../../client'
import { useSettings } from '../context/settings.context'
import { client } from '../client'

export type GhIntegrationCardProps = {
  item: RegistryIndexItem
}
export const GhIntegrationCard: React.FC<GhIntegrationCardProps> = ({ item }) => {
  const { copy } = useClipboard()
  const [webhookUrl, setWebhookUrl] = useState('')
  const settings = useSettings()
  const index = useGetRegistryEntry(item.id, { axios: { baseURL: settings.registryUrl } })

  const generateWebhookUrl = async () => {
    await client.auth.getIntegrationWebhookUrl
      .query({ id: item.id, registryUrl: settings.registryUrl })
      .then((token) =>
        setWebhookUrl(
          `${settings.registryUrl.replace(/\/$/, '')}/integrations/github?token=${token}`
        )
      )
      .catch(showErrorNotification)
  }

  const copyWebhookUrl = () => {
    copy(webhookUrl)
    showSuccessNotification('Copied to clipboard')
  }

  return (
    <Card>
      <LoadingOverlay visible={index.isLoading} />
      <Stack gap={'xs'}>
        <Group justify={'space-between'}>
          <Title order={4}>{item.name}</Title>
          <Group gap={'xs'}>
            <Tooltip label="Open in Github">
              <ActionIcon
                color={'white'}
                variant={'subtle'}
                onClick={() =>
                  window.open(
                    `https://github.com/${index.data?.data.integration?.owner}/${index.data?.data.integration?.repo}`
                  )
                }
              >
                <AiOutlineGithub />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Text size={'xs'}>{item.description}</Text>
        {(webhookUrl && (
          <>
            <Divider />
            <Textarea
              variant={'filled'}
              label={'Webhook URL'}
              readOnly
              value={webhookUrl}
              styles={{ input: { cursor: 'pointer' } }}
              onClick={copyWebhookUrl}
              description={
                "Use this Payload URL to trigger updates to your mods latest.yml file, Set the Webhook Content type to 'application/json' and preferably only trigger on the 'release' event."
              }
            />
          </>
        )) || (
          <Group>
            <Button variant={'default'} onClick={generateWebhookUrl}>
              Generate Webhook URL
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  )
}
