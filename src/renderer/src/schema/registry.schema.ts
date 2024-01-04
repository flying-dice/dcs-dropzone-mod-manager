// Example
// [
//     {
//         "name": "Hello World Mod",
//         "author": "Flying Dice",
//         "preview": "https://images.unsplash.com/photo-1646354380497-92a78ba8dcd8?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         "url": "https://github.com/flying-dice/hello-world-mod"
//     }
// ]

import { z } from 'zod'

export const registryEntrySchema = z.object({
  name: z.string(),
  author: z.string(),
  preview: z.string().url(),
  url: z.string().url()
})

export type RegistryEntry = z.infer<typeof registryEntrySchema>

export const registrySchema = z.array(registryEntrySchema)

export type Registry = z.infer<typeof registrySchema>
