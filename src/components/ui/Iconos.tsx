type PropiedadesIcono = { className?: string };

export function IconoUsuario({ className = "h-5 w-5" }: PropiedadesIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-9 2.24-9 5v3h18v-3c0-2.76-4.58-5-9-5Z" />
    </svg>
  );
}

export function IconoCorreo({ className = "h-5 w-5" }: PropiedadesIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm2 0 8 6 8-6H4Zm16 2.35-7.4 5.55a1 1 0 0 1-1.2 0L4 7.35V19h16V7.35Z" />
    </svg>
  );
}

export function IconoCandado({ className = "h-5 w-5" }: PropiedadesIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  );
}

export function IconoOjo({ className = "h-5 w-5" }: PropiedadesIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconoOjoCerrado({ className = "h-5 w-5" }: PropiedadesIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.5 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-3.4 4.3M6.3 6.3A15.6 15.6 0 0 0 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
