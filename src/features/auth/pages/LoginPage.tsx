import { zodResolver } from '@hookform/resolvers/zod'
import { RHFTextField } from 'foundation-ui'
import { LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useLoginMutation } from '@/features/auth/hooks/useAuthMutations'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      workspace_user_email: '',
      workspace_user_password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    await loginMutation.mutateAsync({ email: values.workspace_user_email, password: values.workspace_user_password })
    navigate(APP_ROUTES.dashboard, { replace: true })
  }

  return (
    <div className="auth-card">
      <div className="auth-card__intro">
        <div className="auth-card__brand-mark">ERP</div>
        <div className="auth-card__intro-copy">
          <p className="auth-card__eyebrow">Ucebul ERP Platform</p>
          <h2>Iniciar sesión</h2>
          <p>Accede al ERP con tu cuenta del Workspace de Ucebul.</p>
        </div>
      </div>

      <form className="auth-form" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <RHFTextField
          autoComplete="email"
          control={form.control}
          label="Correo"
          name="workspace_user_email"
          placeholder="usuario@ucebul.com"
          required
        />

        <RHFTextField
          autoComplete="current-password"
          control={form.control}
          label="Contraseña"
          name="workspace_user_password"
          placeholder="••••••••"
          required
          type="password"
        />

        {loginMutation.error ? (
          <div className="auth-form__error">
            <p>{getErrorMessage(loginMutation.error)}</p>
          </div>
        ) : null}

        <button
          className="btn btn--primary btn--full"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <span className="btn__spinner" aria-hidden="true" />
          ) : (
            <LogIn size={16} aria-hidden="true" />
          )}
          {loginMutation.isPending ? 'Verificando acceso...' : 'Entrar al ERP'}
        </button>
      </form>
    </div>
  )
}
