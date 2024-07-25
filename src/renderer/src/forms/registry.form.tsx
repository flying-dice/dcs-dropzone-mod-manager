import { Button, Group, Stack, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import React from 'react'
import useSWR from 'swr'
import { z } from 'zod'
import { getRegistryIndex } from '../../../lib/client'
import { client } from '../client'
import { showErrorNotification } from '../utils/notifications'

export const RegistryFormSchema = z.object({
  url: z.string().url()
})

export type RegistryFormValues = z.infer<typeof RegistryFormSchema>

export type RegistryFormProps = {
  initialValues?: RegistryFormValues
  onSubmit: (values: RegistryFormValues) => void
  onCancel: () => void
  onReset: () => void
}
export const RegistryForm: React.FC<RegistryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  onReset
}) => {
  const defaultRegistryUrl = useSWR('defaultRegistryUrl', () =>
    client.getDefaultRegistryUrl.query()
  )
  const form = useForm<RegistryFormValues>({
    initialValues,
    validate: zodResolver(RegistryFormSchema),
    validateInputOnBlur: true
  })

  const handleSubmit = () => {
    if (!form.validate().hasErrors) {
      getRegistryIndex({ baseURL: form.values.url })
        .then(() => onSubmit(form.values))
        .catch((error) => showErrorNotification(error))
    }
  }

  return (
    <Stack>
      <TextInput
        label={'Registry URL'}
        description={'Enter a registry URL to use for mods'}
        placeholder={defaultRegistryUrl.data}
        {...form.getInputProps('url')}
      />
      <Group justify={'space-between'}>
        <Button variant={'subtle'} onClick={onReset}>
          Reset
        </Button>
        <Group justify={'end'}>
          <Button variant={'default'} onClick={onCancel}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={!form.isValid()}>
            Save
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}
