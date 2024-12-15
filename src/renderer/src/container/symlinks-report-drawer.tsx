import { ActionIcon, Drawer, LoadingOverlay, Stack, Table } from '@mantine/core'
import React from 'react'
import { VscLinkExternal } from 'react-icons/vsc'
import useSWR from 'swr'
import { client } from '../client'
import { CodeHighlight } from '@mantine/code-highlight'

const _SymlinksReportDrawer: React.FC<{ modId: string }> = ({ modId }) => {
  const assets = useSWR(`/mods/${modId}/symlinks`, () => client.getModAssets.query({ modId }))

  return (
    <Stack>
      <LoadingOverlay visible={assets.isLoading} />
      <Table style={{ width: '100%', tableLayout: 'fixed', maxWidth: '100%' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Where It’s From</Table.Th>
            <Table.Th>Where It’s Linked</Table.Th>
            <Table.Th w={64}>Open</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {assets.data?.map((asset) => (
            <Table.Tr key={asset.id}>
              <Table.Td>
                <CodeHighlight code={asset.source} language={'text'} />
              </Table.Td>
              <Table.Td>
                <CodeHighlight code={asset.symlinkPath || 'Unlinked'} language={'text'} />
              </Table.Td>
              <Table.Td align={'center'}>
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
      size={'90vw'}
      position={'right'}
      opened={opened}
      title={'Installation Details'}
      onClose={onClose}
    >
      {modId && <_SymlinksReportDrawer modId={modId} />}
    </Drawer>
  )
}
