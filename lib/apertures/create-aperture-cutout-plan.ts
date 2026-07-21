import type { JscadOperation } from "jscad-planner"
import type {
  EnclosureApertureInput,
  EnclosureWall,
  ResolvedEnclosureAperture,
  ResolvedEnclosureDimensions,
} from "../types"
import { getApertureDimensions } from "./get-aperture-dimensions"

const BOOLEAN_TOLERANCE = 0.5

const cuboid = (size: [number, number, number]): JscadOperation => ({
  type: "cuboid",
  size,
})

const cylinder = (radius: number, height: number): JscadOperation => ({
  type: "cylinder",
  radius,
  height,
  resolution: 32,
})

const translate = (
  vector: [number, number, number],
  shape: JscadOperation,
): JscadOperation => ({ type: "translate", vector, shape })

const rotateForWall = (
  wall: EnclosureWall,
  shape: JscadOperation,
): JscadOperation =>
  wall === "left" || wall === "right"
    ? { type: "rotate", angles: [0, Math.PI / 2, 0], shape }
    : { type: "rotate", angles: [Math.PI / 2, 0, 0], shape }

const createRectCutout = ({
  wall,
  width,
  height,
  cutDepth,
}: {
  wall: EnclosureWall
  width: number
  height: number
  cutDepth: number
}): JscadOperation =>
  wall === "left" || wall === "right"
    ? cuboid([cutDepth, width, height])
    : cuboid([width, cutDepth, height])

const createCircleCutout = ({
  wall,
  diameter,
  cutDepth,
}: {
  wall: EnclosureWall
  diameter: number
  cutDepth: number
}): JscadOperation => rotateForWall(wall, cylinder(diameter / 2, cutDepth))

const createPillCutout = ({
  wall,
  width,
  height,
  cutDepth,
}: {
  wall: EnclosureWall
  width: number
  height: number
  cutDepth: number
}): JscadOperation => {
  if (Math.abs(width - height) < Number.EPSILON) {
    return createCircleCutout({ wall, diameter: width, cutDepth })
  }

  const isHorizontal = width > height
  const radius = Math.min(width, height) / 2
  const centerLength = Math.abs(width - height)
  const center = createRectCutout({
    wall,
    width: isHorizontal ? centerLength : width,
    height: isHorizontal ? height : centerLength,
    cutDepth,
  })
  const end = rotateForWall(wall, cylinder(radius, cutDepth))
  const offsetVector = (distance: number): [number, number, number] => {
    if (!isHorizontal) return [0, 0, distance]
    return wall === "left" || wall === "right"
      ? [0, distance, 0]
      : [distance, 0, 0]
  }

  return {
    type: "union",
    shapes: [
      center,
      translate(offsetVector(-centerLength / 2), end),
      translate(offsetVector(centerLength / 2), end),
    ],
  }
}

const placeOnWall = ({
  aperture,
  dimensions,
  shape,
}: {
  aperture: EnclosureApertureInput
  dimensions: ResolvedEnclosureDimensions
  shape: JscadOperation
}): JscadOperation => {
  const { wall, offset, centerZ } = aperture
  const normalPosition =
    (wall === "left" || wall === "right"
      ? dimensions.width
      : dimensions.height) /
      2 -
    dimensions.wallThickness / 2

  switch (wall) {
    case "left":
      return translate([-normalPosition, offset, centerZ], shape)
    case "right":
      return translate([normalPosition, offset, centerZ], shape)
    case "front":
      return translate([offset, -normalPosition, centerZ], shape)
    case "back":
      return translate([offset, normalPosition, centerZ], shape)
  }
}

/**
 * Builds the complete through-wall subtraction for one aperture. Shape,
 * clearance, wall orientation, and placement deliberately live with the
 * aperture rather than in the enclosure-shell planner.
 */
export const createApertureCutoutPlan = ({
  aperture,
  dimensions,
}: {
  aperture: EnclosureApertureInput
  dimensions: ResolvedEnclosureDimensions
}): ResolvedEnclosureAperture => {
  const { width, height } = getApertureDimensions(aperture)
  const cutDepth = dimensions.wallThickness + BOOLEAN_TOLERANCE * 2

  let localShape: JscadOperation
  switch (aperture.shape) {
    case "rect":
      localShape = createRectCutout({
        wall: aperture.wall,
        width,
        height,
        cutDepth,
      })
      break
    case "circle":
      localShape = createCircleCutout({
        wall: aperture.wall,
        diameter: width,
        cutDepth,
      })
      break
    case "pill":
      localShape = createPillCutout({
        wall: aperture.wall,
        width,
        height,
        cutDepth,
      })
      break
  }

  return {
    aperture,
    width,
    height,
    cutDepth,
    jscadPlan: placeOnWall({ aperture, dimensions, shape: localShape }),
  }
}
