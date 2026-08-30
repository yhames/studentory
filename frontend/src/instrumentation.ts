import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'development',
    tracesSampleRate: parseSampleRate(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
    ),
    sendDefaultPii: false,
  })
}

function parseSampleRate(value: string | undefined): number {
  if (value === undefined) {
    return 0
  }

  const rate = Number(value)
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0
}
