import React from 'react'
import { Anchor, Divider, List, Stack, Text, Textarea } from '@mantine/core'
import { RegistryEntry } from '../schema/registry.schema'
import { openModal } from '@mantine/modals'
import useSWR from 'swr'
import axios from 'axios'

export type RegistryEntryModalProps = {
  entry: RegistryEntry
}
export const RegistryEntryModal: React.FC<RegistryEntryModalProps> = ({ entry }) => {
  const releases = useSWR('/flying-dice/hello-world-mod/releases', async (url) =>
    axios.get(url, { baseURL: 'https://api.github.com/repos' }).then((it) => it.data)
  )

  const readme = useSWR('/flying-dice/hello-world-mod/main/README.md', async (url) =>
    axios.get(url, { baseURL: 'https://raw.githubusercontent.com' }).then((it) => it.data)
  )

  return (
    <Stack>
      {/*// TODO: Render Markdown*/}
      <Textarea autosize value={readme?.data} />
      <Stack gap={0}>
        <Divider label={'Releases'} />
        <List>
          {releases?.data?.map((release) => (
            <List.Item>
              <Anchor href={release.html_url} target={'_blank'}>
                {release.tag_name} - {release.name}
              </Anchor>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Stack>
  )
}

export const openRegistryEntryModal = (entry: RegistryEntry) =>
  openModal({
    size: 'xl',
    title: <Anchor target={'_blank'} href={entry.url}>{`${entry.name} by ${entry.author}`}</Anchor>,
    children: <RegistryEntryModal entry={entry} />
  })
