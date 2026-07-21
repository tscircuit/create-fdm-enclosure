import type { JscadOperation } from "jscad-planner"

export type EnclosureWall = "front" | "right" | "back" | "left"

export interface EnclosureBoardInput {
  /** Board width along X, in millimetres. */
  width: number
  /** Board height along Y, in millimetres. */
  height: number
  /** Board thickness along Z, in millimetres. */
  thickness: number
}

interface CommonEnclosureApertureInput {
  /** Wall containing the aperture. */
  wall: EnclosureWall
  /** Signed offset from the wall midpoint along the wall, in millimetres. */
  offset: number
  /** Height of the aperture centre above the outside enclosure floor. */
  centerZ: number
  /** Extra clearance applied on every edge. */
  margin?: number
}

export interface RectEnclosureApertureInput
  extends CommonEnclosureApertureInput {
  shape: "rect"
  width: number
  height: number
}

export interface PillEnclosureApertureInput
  extends CommonEnclosureApertureInput {
  shape: "pill"
  width: number
  height: number
}

export interface CircleEnclosureApertureInput
  extends CommonEnclosureApertureInput {
  shape: "circle"
  radius: number
}

export type EnclosureApertureInput =
  | RectEnclosureApertureInput
  | PillEnclosureApertureInput
  | CircleEnclosureApertureInput

export interface CreateFdmEnclosureInput {
  board: EnclosureBoardInput
  /** Outside X dimension. Inferred when omitted. */
  width?: number
  /** Outside Y dimension. Inferred when omitted. */
  height?: number
  /** Outside Z dimension. Inferred when omitted. */
  depth?: number
  /** Side wall thickness. Defaults to 2 mm. */
  wallThickness?: number
  /** Floor thickness. Defaults to wallThickness. */
  floorThickness?: number
  /** Horizontal clearance between each board edge and the inside wall. */
  boardClearance?: number
  /** Empty vertical space above the board. */
  clearanceAboveBoard?: number
  apertures?: EnclosureApertureInput[]
}

export interface ResolvedEnclosureDimensions {
  width: number
  height: number
  depth: number
  wallThickness: number
  floorThickness: number
  boardClearance: number
  clearanceAboveBoard: number
}

export interface ResolvedEnclosureAperture {
  aperture: EnclosureApertureInput
  width: number
  height: number
  cutDepth: number
  jscadPlan: JscadOperation
}

export interface CreateFdmEnclosureOutput {
  dimensions: ResolvedEnclosureDimensions
  apertures: ResolvedEnclosureAperture[]
  jscadPlan: JscadOperation
}
