import React from 'react'
import { Release } from '../providers/RegistryContentProvider'
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core'
import ms from 'ms'

export type ReleaseSummaryProps = {
  latest?: boolean
  release: Release
}
export const ReleaseSummary: React.FC<ReleaseSummaryProps> = ({ latest, release }) => {
  return (
    <Stack gap={0}>
      <Group justify={'space-between'}>
        <Anchor size={'sm'} href={release.htmlUrl} target={'_blank'}>
          {release.tag} - {release.name}
        </Anchor>
        {latest && (
          <Badge size={'xs'} color={'green'} variant={'outline'}>
            Latest
          </Badge>
        )}
      </Group>
      <Text size={'xs'} c={'dimmed'}>
        {ms(Date.now() - +new Date(release.created))} ago
      </Text>
    </Stack>
  )
}
