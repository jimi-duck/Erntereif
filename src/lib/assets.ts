/**
 * Dataset image paths are absolute (`/produce/carrot.svg`) so they read as
 * plain URLs, but the app may be served from a sub-path — resolve against the
 * Vite base URL rather than the domain root.
 */
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
