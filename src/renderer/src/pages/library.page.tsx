import React from 'react'
import { Badge, Button, Card, Group, Image, Stack, Text, TextInput, Title } from '@mantine/core'
import { VscSearch } from 'react-icons/vsc'
import { range } from '@mantine/hooks'

export type LibraryPageProps = {}
export const LibraryPage: React.FC<LibraryPageProps> = ({}) => {
  return (
    <Stack>
      <Title order={3}>Library</Title>
      <TextInput
        label={'Search'}
        leftSection={<VscSearch />}
        placeholder={'Search Mod Repository'}
      ></TextInput>
      <Group>
        {range(0, 10).map((i) => (
          <Card p={0}>
            <Stack gap={0} w={300} justify={'space-between'} h={400}>
              <Stack gap={0}>
                <Card.Section>
                  <Image
                    src="https://images.unsplash.com/photo-1562545876-d4eb36ae854b?q=80&w=3028&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    height={160}
                    alt="preview"
                  />
                </Card.Section>
                <Stack gap={0} pl={'md'} pr={'md'}>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500} maw={175} truncate>
                      Example Mod {i}
                    </Text>
                    <Badge size={'sm'} color="pink">
                      Featured
                    </Badge>
                  </Group>
                  <Text size={'xs'} lineClamp={6} c={'dimmed'}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                  </Text>
                </Stack>
              </Stack>
              <Stack p={'md'}>
                <Button color="blue">Install</Button>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Group>
    </Stack>
  )
}
