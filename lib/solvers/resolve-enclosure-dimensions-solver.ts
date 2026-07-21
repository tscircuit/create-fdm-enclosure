import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import { getApertureDimensions } from "../apertures/get-aperture-dimensions"
import type {
  CreateFdmEnclosureInput,
  EnclosureApertureInput,
  ResolvedEnclosureDimensions,
} from "../types"
import { visualizeEnclosure } from "../visualize-enclosure"

const DEFAULT_WALL_THICKNESS = 2
const DEFAULT_BOARD_CLEARANCE = 1
const DEFAULT_CLEARANCE_ABOVE_BOARD = 6

const assertFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value)) throw new Error(`${name} must be finite`)
}

const assertPositive = (value: number, name: string): void => {
  assertFinite(value, name)
  if (value <= 0) throw new Error(`${name} must be greater than 0`)
}

const assertNonNegative = (value: number, name: string): void => {
  assertFinite(value, name)
  if (value < 0) throw new Error(`${name} must not be negative`)
}

const validateAperture = (
  aperture: EnclosureApertureInput,
  index: number,
): void => {
  const prefix = `apertures[${index}]`
  assertFinite(aperture.offset, `${prefix}.offset`)
  assertPositive(aperture.centerZ, `${prefix}.centerZ`)
  assertNonNegative(aperture.margin ?? 0, `${prefix}.margin`)
  if (aperture.shape === "circle") {
    assertPositive(aperture.radius, `${prefix}.radius`)
  } else {
    assertPositive(aperture.width, `${prefix}.width`)
    assertPositive(aperture.height, `${prefix}.height`)
  }
}

export class ResolveEnclosureDimensionsSolver extends BaseSolver {
  dimensions?: ResolvedEnclosureDimensions

  constructor(private readonly input: CreateFdmEnclosureInput) {
    super()
  }

  override _step(): void {
    assertPositive(this.input.board.width, "board.width")
    assertPositive(this.input.board.height, "board.height")
    assertPositive(this.input.board.thickness, "board.thickness")

    const wallThickness = this.input.wallThickness ?? DEFAULT_WALL_THICKNESS
    const floorThickness = this.input.floorThickness ?? wallThickness
    const boardClearance = this.input.boardClearance ?? DEFAULT_BOARD_CLEARANCE
    const clearanceAboveBoard =
      this.input.clearanceAboveBoard ?? DEFAULT_CLEARANCE_ABOVE_BOARD

    assertPositive(wallThickness, "wallThickness")
    assertPositive(floorThickness, "floorThickness")
    assertNonNegative(boardClearance, "boardClearance")
    assertNonNegative(clearanceAboveBoard, "clearanceAboveBoard")

    const apertures = this.input.apertures ?? []
    for (const [index, aperture] of apertures.entries()) {
      validateAperture(aperture, index)
    }
    const minimumWidth =
      this.input.board.width + 2 * (wallThickness + boardClearance)
    const minimumHeight =
      this.input.board.height + 2 * (wallThickness + boardClearance)
    const minimumBoardDepth =
      floorThickness + this.input.board.thickness + clearanceAboveBoard
    const minimumApertureDepth = Math.max(
      0,
      ...apertures.map((aperture) => {
        const { height } = getApertureDimensions(aperture)
        return aperture.centerZ + height / 2 + wallThickness
      }),
    )
    const dimensions: ResolvedEnclosureDimensions = {
      width: this.input.width ?? minimumWidth,
      height: this.input.height ?? minimumHeight,
      depth:
        this.input.depth ?? Math.max(minimumBoardDepth, minimumApertureDepth),
      wallThickness,
      floorThickness,
      boardClearance,
      clearanceAboveBoard,
    }

    assertPositive(dimensions.width, "width")
    assertPositive(dimensions.height, "height")
    assertPositive(dimensions.depth, "depth")
    if (dimensions.width < minimumWidth) {
      throw new Error(`width must be at least ${minimumWidth} mm for the board`)
    }
    if (dimensions.height < minimumHeight) {
      throw new Error(
        `height must be at least ${minimumHeight} mm for the board`,
      )
    }
    if (dimensions.depth < minimumBoardDepth) {
      throw new Error(
        `depth must be at least ${minimumBoardDepth} mm for the board`,
      )
    }

    for (const [index, aperture] of apertures.entries()) {
      const { width, height } = getApertureDimensions(aperture)
      const wallLength =
        aperture.wall === "front" || aperture.wall === "back"
          ? dimensions.width
          : dimensions.height
      if (Math.abs(aperture.offset) + width / 2 > wallLength / 2) {
        throw new Error(`apertures[${index}] extends beyond its wall`)
      }
      if (aperture.centerZ - height / 2 < floorThickness) {
        throw new Error(`apertures[${index}] intersects the enclosure floor`)
      }
      if (aperture.centerZ + height / 2 > dimensions.depth) {
        throw new Error(`apertures[${index}] extends above its wall`)
      }
    }

    this.dimensions = dimensions
    this.solved = true
  }

  override getOutput(): ResolvedEnclosureDimensions {
    if (!this.dimensions)
      throw new Error("Enclosure dimensions are not resolved")
    return this.dimensions
  }

  override getConstructorParams(): [CreateFdmEnclosureInput] {
    return [this.input]
  }

  override visualize(): GraphicsObject {
    if (!this.dimensions) return super.visualize()
    return visualizeEnclosure({
      title: "Resolved enclosure dimensions",
      input: this.input,
      dimensions: this.dimensions,
    })
  }
}
