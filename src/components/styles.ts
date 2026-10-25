/** Shared class strings for pill buttons and form fields. */
export const btn = {
  primary:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sand px-6 text-center font-semibold text-deep transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress',
  dark: 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep px-6 text-center font-semibold text-sand transition hover:brightness-125 active:scale-[0.98]',
  ghost:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep px-5 text-center font-semibold text-ink ring-1 ring-white/15 transition hover:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
  small:
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-sand px-4 text-center text-sm font-semibold text-deep transition hover:brightness-105 active:scale-[0.98]',
  smallDark:
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-deep px-4 text-center text-sm font-semibold text-sand transition hover:brightness-125 active:scale-[0.98]',
  smallGhost:
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-deep px-4 text-center text-sm font-semibold text-ink ring-1 ring-white/15 transition hover:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
  text: 'inline-flex min-h-10 items-center gap-1 rounded-full px-1 text-sm font-semibold text-sand underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-haze/60 disabled:no-underline',
  icon: 'grid size-11 shrink-0 place-items-center rounded-full bg-panel text-ink transition hover:bg-deep',
}

export const field = {
  label: 'mb-1.5 block text-sm font-semibold',
  input:
    'block w-full rounded-2xl bg-deep px-4 py-3 text-base text-ink ring-1 ring-white/10 placeholder:text-muted aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-salmon',
  /** Same as input, without the ring, for fields that set their own. */
  inputBare: 'block w-full rounded-2xl bg-deep px-4 py-3 text-base text-ink placeholder:text-muted',
  hint: 'mt-1.5 text-sm text-muted',
  error: 'mt-1.5 flex items-start gap-1.5 text-sm font-medium text-salmon',
}
