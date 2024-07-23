import React, { useState } from 'react'
import { Stack, Title } from '@mantine/core'
import { Subscriptions } from '../container/subscriptions'
import { SymlinksReportDrawer } from '../container/symlinks-report-drawer'

export const MyContentPage: React.FC = () => {
  const [symlinksMod, setSymlinksMod] = useState<string | null>(null)

  return (
    <Stack>
      <Title order={3}>My Content</Title>
      <Subscriptions onOpenSymlinksModal={setSymlinksMod} />
      <SymlinksReportDrawer
        modId={symlinksMod || undefined}
        opened={Boolean(symlinksMod)}
        onClose={() => setSymlinksMod(null)}
      />
    </Stack>
  )
}
