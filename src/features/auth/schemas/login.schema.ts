import { z } from 'zod'

export const loginSchema = z.object({
  workspace_user_email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
  workspace_user_password: z.string().min(1, 'La contraseña es requerida'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
