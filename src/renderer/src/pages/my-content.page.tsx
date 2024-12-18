import { Stack, Title } from '@mantine/core'
import React, { useState } from 'react'
import { Subscriptions } from '../container/subscriptions'
import { SymlinksReportDrawer } from '../container/symlinks-report-drawer'
import { DcsMissionScriptingModal } from '@renderer/modal/dcs-mission-scripting.modal'

export const MyContentPage: React.FC = () => {
  const [symlinksMod, setSymlinksMod] = useState<string | null>(null)

  return (
    <Stack>
      <DcsMissionScriptingModal />

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
