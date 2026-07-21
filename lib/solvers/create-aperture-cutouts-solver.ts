import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import { createApertureCutoutPlan } from "../apertures/create-aperture-cutout-plan"
import type {
  CreateFdmEnclosureInput,
  ResolvedEnclosureAperture,
  ResolvedEnclosureDimensions,
} from "../types"
import { visualizeEnclosure } from "../visualize-enclosure"

export class CreateApertureCutoutsSolver extends BaseSolver {
  apertureCutouts: ResolvedEnclosureAperture[] = []

  constructor(
    private readonly params: {
      input: CreateFdmEnclosureInput
      dimensions: ResolvedEnclosureDimensions
    },
  ) {
    super()
    this.MAX_ITERATIONS = (params.input.apertures?.length ?? 0) + 1
  }

  override _step(): void {
    const apertures = this.params.input.apertures ?? []
    const aperture = apertures[this.apertureCutouts.length]
    if (!aperture) {
      this.solved = true
      return
    }

    this.apertureCutouts.push(
      createApertureCutoutPlan({
        aperture,
        dimensions: this.params.dimensions,
      }),
    )
    if (this.apertureCutouts.length === apertures.length) this.solved = true
  }

  computeProgress(): number {
    const apertureCount = this.params.input.apertures?.length ?? 0
    if (apertureCount === 0) return this.solved ? 1 : 0
    return this.apertureCutouts.length / apertureCount
  }

  override getOutput(): ResolvedEnclosureAperture[] {
    return this.apertureCutouts
  }

  override getConstructorParams(): [typeof this.params] {
    return [this.params]
  }

  override visualize(): GraphicsObject {
    return visualizeEnclosure({
      title: `Aperture cutouts (${this.apertureCutouts.length}/${this.params.input.apertures?.length ?? 0})`,
      input: this.params.input,
      dimensions: this.params.dimensions,
      processedApertureCount: this.apertureCutouts.length,
    })
  }
}
