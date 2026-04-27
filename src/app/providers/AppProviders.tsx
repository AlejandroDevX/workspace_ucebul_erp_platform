import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, ucebulDarkTheme, ucebulLightTheme } from 'foundation-ui'
import { type PropsWithChildren, useEffect } from 'react'
import { ensurePortalRoot } from 'foundation-ui/utils/portal'
import { queryClient } from '@/lib/query-client'
import { AppBootstrap } from '@/app/providers/AppBootstrap'

function FoundationPortalRoot() {
  useEffect(() => {
    ensurePortalRoot()
  }, [])

  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultThemeId={ucebulLightTheme.id}
        themes={[ucebulLightTheme, ucebulDarkTheme]}
      >
        <FoundationPortalRoot />
        <AppBootstrap />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
