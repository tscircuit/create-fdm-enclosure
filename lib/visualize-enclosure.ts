import type { GraphicsObject } from "graphics-debug"
import { getApertureDimensions } from "./apertures/get-aperture-dimensions"
import type {
  CreateFdmEnclosureInput,
  EnclosureApertureInput,
  EnclosureWall,
  ResolvedEnclosureDimensions,
} from "./types"

const WALL_ORDER: EnclosureWall[] = ["front", "right", "back", "left"]
const PANEL_GAP = 5

const getWallLength = (
  wall: EnclosureWall,
  dimensions: ResolvedEnclosureDimensions,
): number =>
  wall === "front" || wall === "back" ? dimensions.width : dimensions.height

const getWallPanelCenters = (
  dimensions: ResolvedEnclosureDimensions,
): Map<EnclosureWall, number> => {
  const centers = new Map<EnclosureWall, number>()
  const totalWidth = WALL_ORDER.reduce(
    (sum, wall) => sum + getWallLength(wall, dimensions),
    PANEL_GAP * (WALL_ORDER.length - 1),
  )
  let cursor = -totalWidth / 2

  for (const wall of WALL_ORDER) {
    const length = getWallLength(wall, dimensions)
    centers.set(wall, cursor + length / 2)
    cursor += length + PANEL_GAP
  }

  return centers
}

const getPanelCenter = (
  centers: Map<EnclosureWall, number>,
  wall: EnclosureWall,
): number => {
  const center = centers.get(wall)
  if (center === undefined) throw new Error(`Missing ${wall} wall panel`)
  return center
}

const addApertureGraphics = ({
  graphics,
  aperture,
  panelCenterX,
  isProcessed,
}: {
  graphics: GraphicsObject
  aperture: EnclosureApertureInput
  panelCenterX: number
  isProcessed: boolean
}): void => {
  const { width, height } = getApertureDimensions(aperture)
  const center = {
    x: panelCenterX + aperture.offset,
    y: aperture.centerZ,
  }
  const fill = isProcessed
    ? "rgba(239, 68, 68, 0.4)"
    : "rgba(148, 163, 184, 0.12)"
  const stroke = isProcessed ? "#dc2626" : "#94a3b8"
  const label = `${aperture.shape} ${width.toFixed(1)}×${height.toFixed(1)}`

  if (aperture.shape === "rect") {
    graphics.rects?.push({ center, width, height, fill, stroke, label })
    return
  }

  if (aperture.shape === "circle") {
    graphics.circles?.push({
      center,
      radius: width / 2,
      fill,
      stroke,
      label,
    })
    return
  }

  const isHorizontal = width >= height
  const radius = Math.min(width, height) / 2
  const centerLength = Math.abs(width - height)
  graphics.rects?.push({
    center,
    width: isHorizontal ? centerLength : width,
    height: isHorizontal ? height : centerLength,
    fill,
    stroke,
    label,
  })
  graphics.circles?.push(
    {
      center: {
        x: center.x + (isHorizontal ? -centerLength / 2 : 0),
        y: center.y + (isHorizontal ? 0 : -centerLength / 2),
      },
      radius,
      fill,
      stroke,
    },
    {
      center: {
        x: center.x + (isHorizontal ? centerLength / 2 : 0),
        y: center.y + (isHorizontal ? 0 : centerLength / 2),
      },
      radius,
      fill,
      stroke,
    },
  )
}

export const visualizeEnclosure = ({
  title,
  input,
  dimensions,
  processedApertureCount = 0,
}: {
  title: string
  input: CreateFdmEnclosureInput
  dimensions: ResolvedEnclosureDimensions
  processedApertureCount?: number
}): GraphicsObject => {
  const graphics: GraphicsObject = {
    title,
    coordinateSystem: "cartesian",
    rects: [],
    circles: [],
    lines: [],
    points: [],
    texts: [],
  }
  const centers = getWallPanelCenters(dimensions)

  for (const wall of WALL_ORDER) {
    const centerX = getPanelCenter(centers, wall)
    graphics.rects?.push({
      center: { x: centerX, y: dimensions.depth / 2 },
      width: getWallLength(wall, dimensions),
      height: dimensions.depth,
      fill: "rgba(59, 130, 246, 0.08)",
      stroke: "#2563eb",
      label: wall,
    })
    graphics.texts?.push({
      x: centerX,
      y: dimensions.depth + 1.5,
      text: wall,
      anchorSide: "bottom_center",
      color: "#1e3a8a",
      fontSize: 1.5,
    })
  }

  const apertures = input.apertures ?? []
  for (const [index, aperture] of apertures.entries()) {
    addApertureGraphics({
      graphics,
      aperture,
      panelCenterX: getPanelCenter(centers, aperture.wall),
      isProcessed: index < processedApertureCount,
    })
  }

  const topViewY = -dimensions.height / 2 - PANEL_GAP
  graphics.rects?.push(
    {
      center: { x: 0, y: topViewY },
      width: dimensions.width,
      height: dimensions.height,
      fill: "rgba(59, 130, 246, 0.05)",
      stroke: "#1d4ed8",
      label: "enclosure top view",
    },
    {
      center: { x: 0, y: topViewY },
      width: input.board.width,
      height: input.board.height,
      fill: "rgba(34, 197, 94, 0.18)",
      stroke: "#15803d",
      label: "board",
    },
  )

  return graphics
}
