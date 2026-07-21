import type { EnclosureApertureInput } from "../types"

export const getApertureDimensions = (
  aperture: EnclosureApertureInput,
): { width: number; height: number } => {
  const margin = aperture.margin ?? 0
  if (aperture.shape === "circle") {
    const diameter = 2 * (aperture.radius + margin)
    return { width: diameter, height: diameter }
  }

  return {
    width: aperture.width + margin * 2,
    height: aperture.height + margin * 2,
  }
}
