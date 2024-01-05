import React, { forwardRef } from 'react'
import {
  Avatar,
  Button,
  Group,
  Menu,
  MenuDropdown,
  Stack,
  Text,
  UnstyledButton
} from '@mantine/core'
import { useGhUser } from '../context/gh-user.context'
import { useAsync } from 'react-use'
import { AiOutlineGithub } from 'react-icons/ai'

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  image: string
  username: string
  name?: string
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, username, name, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      style={{
        color: 'var(--mantine-color-text)',
        borderRadius: 'var(--mantine-radius-sm)'
      }}
      {...others}
    >
      <Group>
        <Avatar src={image} radius="xl" size={'sm'} />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {username}
          </Text>

          <Text c="dimmed" size="xs">
            {name}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  )
)
UserButton.displayName = 'UserButton'

export type GhProfileProps = {}
export const GhProfile: React.FC<GhProfileProps> = ({}) => {
  const { octokit, login, logout } = useGhUser()
  const user = useAsync(async () => octokit?.request('GET /user').then((it) => it.data), [octokit])

  return (
    <Stack pr={'sm'}>
      {(user.value && (
        <Menu shadow={'md'}>
          <Menu.Target>
            <UserButton
              image={user.value.avatar_url}
              username={user.value.login}
              name={user.value.name || undefined}
            />
          </Menu.Target>

          <MenuDropdown w={150}>
            <Menu.Item onClick={logout}>Logout</Menu.Item>
          </MenuDropdown>
        </Menu>
      )) || (
        <Button
          onClick={login}
          color={'white'}
          size={'sm'}
          variant={'subtle'}
          leftSection={<AiOutlineGithub />}
        >
          Login
        </Button>
      )}
    </Stack>
  )
}
