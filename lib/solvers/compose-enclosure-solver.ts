import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import type { JscadOperation } from "jscad-planner"
import type {
  CreateFdmEnclosureInput,
  ResolvedEnclosureAperture,
  ResolvedEnclosureDimensions,
} from "../types"
import { visualizeEnclosure } from "../visualize-enclosure"

export class ComposeEnclosureSolver extends BaseSolver {
  enclosurePlan?: JscadOperation

  constructor(
    private readonly params: {
      input: CreateFdmEnclosureInput
      dimensions: ResolvedEnclosureDimensions
      shellPlan: JscadOperation
      apertureCutouts: ResolvedEnclosureAperture[]
    },
  ) {
    super()
  }

  override _step(): void {
    this.enclosurePlan =
      this.params.apertureCutouts.length === 0
        ? this.params.shellPlan
        : {
            type: "subtract",
            shapes: [
              this.params.shellPlan,
              ...this.params.apertureCutouts.map((cutout) => cutout.jscadPlan),
            ],
          }
    this.solved = true
  }

  override getOutput(): JscadOperation {
    if (!this.enclosurePlan) {
      throw new Error("Enclosure plan has not been composed")
    }
    return this.enclosurePlan
  }

  override getConstructorParams(): [typeof this.params] {
    return [this.params]
  }

  override visualize(): GraphicsObject {
    return visualizeEnclosure({
      title: "Composed enclosure",
      input: this.params.input,
      dimensions: this.params.dimensions,
      processedApertureCount: this.params.apertureCutouts.length,
    })
  }
}
