import type React from "react"

type ModelViewerAttributes = React.HTMLAttributes<HTMLElement> & {
  src?: string
  alt?: string
  "auto-rotate"?: boolean
  "camera-controls"?: boolean
  "camera-orbit"?: string
  "shadow-intensity"?: string
  exposure?: string
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        ModelViewerAttributes,
        HTMLElement
      >
    }
  }
}
