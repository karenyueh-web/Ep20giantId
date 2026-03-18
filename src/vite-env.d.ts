/// <reference types="vite/client" />

// Allow TypeScript to import PNG / JPG / SVG / WebP as string URLs
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
