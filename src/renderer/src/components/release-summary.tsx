import React from 'react'
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core'
import ms from 'ms'
import { EntryLatestRelease } from '../../../client'

export type ReleaseSummaryProps = {
  latest?: boolean
  release: EntryLatestRelease
}
export const ReleaseSummary: React.FC<ReleaseSummaryProps> = ({ latest, release }) => {
  return (
    <Stack gap={0}>
      <Group justify={'space-between'}>
        <Anchor size={'sm'} href={release.releasepage} target={'_blank'}>
          {release.version} - {release.name}
        </Anchor>
        {latest && (
          <Badge size={'xs'} color={'green'} variant={'outline'}>
            Latest
          </Badge>
        )}
      </Group>
      <Text size={'xs'} c={'dimmed'}>
        {ms(Date.now() - +new Date(release.date))} ago
      </Text>
    </Stack>
  )
}
