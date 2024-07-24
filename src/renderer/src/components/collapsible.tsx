import { Button, type ButtonProps, Collapse, type CollapseProps, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type React from 'react'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'

export type CollapsibleProps = {
  children: React.ReactNode
  initialExpanded?: boolean
  labels: {
    expand: string
    collapse: string
  }
  _props?: {
    button?: ButtonProps
    collapse?: CollapseProps
  }
}
export const Collapsible: React.FC<CollapsibleProps> = ({
  _props,
  initialExpanded,
  children,
  labels
}) => {
  const [isOpen, collapsible] = useDisclosure(initialExpanded || false)
  return (
    <Stack gap={0}>
      <Button
        pl={0}
        justify={'start'}
        leftSection={isOpen ? <VscChevronDown /> : <VscChevronRight />}
        variant={'transparent'}
        onClick={collapsible.toggle}
        {..._props?.button}
      >
        {isOpen ? labels.collapse : labels.expand}
      </Button>
      <Collapse in={isOpen} {..._props?.collapse}>
        {children}
      </Collapse>
    </Stack>
  )
}
