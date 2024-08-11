import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text
} from '@mantine/core'
import React from 'react'
import { VscLinkExternal } from 'react-icons/vsc'
import useSWR from 'swr'
import { client } from '../client'

const _SymlinksReportDrawer: React.FC<{ modId: string }> = ({ modId }) => {
  const assets = useSWR(`/mods/${modId}/symlinks`, () => client.getModAssets.query({ modId }))
  return (
    <Stack>
      <LoadingOverlay visible={assets.isLoading} />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>True Source</Table.Th>
            <Table.Th>Linked DCS Location</Table.Th>
            <Table.Th>Open</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {assets.data?.map((asset) => (
            <Table.Tr key={asset.id}>
              <Table.Td>
                <Text size={'sm'}>{asset.source}</Text>
              </Table.Td>
              <Table.Td>
                <Text size={'sm'}>{asset.symlinkPath || 'Unlinked'}</Text>
              </Table.Td>
              <Table.Td w={64}>
                <ActionIcon
                  onClick={() => client.openAssetInExplorer.mutate({ assetId: asset.id })}
                  variant={'transparent'}
                  size={'sm'}
                  disabled={!asset.symlinkPath}
                >
                  <VscLinkExternal />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group>
        <Button variant={'subtle'} onClick={() => client.openInExplorer.mutate({ modId })}>
          Open in Explorer
        </Button>
      </Group>
    </Stack>
  )
}

export type SymlinksReportDrawerProps = {
  modId?: string
  opened: boolean
  onClose: () => void
}
export const SymlinksReportDrawer: React.FC<SymlinksReportDrawerProps> = ({
  modId,
  opened,
  onClose
}) => {
  return (
    <Drawer
      size={'xl'}
      position={'right'}
      opened={opened}
      title={'Installation Details'}
      onClose={onClose}
    >
      {modId && <_SymlinksReportDrawer modId={modId} />}
    </Drawer>
  )
}
