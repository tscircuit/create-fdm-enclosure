import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import type { JscadOperation } from "jscad-planner"
import type {
  CreateFdmEnclosureInput,
  ResolvedEnclosureDimensions,
} from "../types"
import { visualizeEnclosure } from "../visualize-enclosure"

export class CreateEnclosureShellSolver extends BaseSolver {
  shellPlan?: JscadOperation

  constructor(
    private readonly params: {
      input: CreateFdmEnclosureInput
      dimensions: ResolvedEnclosureDimensions
    },
  ) {
    super()
  }

  override _step(): void {
    const { width, height, depth, wallThickness, floorThickness } =
      this.params.dimensions
    const insideWidth = width - 2 * wallThickness
    const insideHeight = height - 2 * wallThickness

    this.shellPlan = {
      type: "subtract",
      shapes: [
        {
          type: "translate",
          vector: [0, 0, depth / 2],
          shape: { type: "cuboid", size: [width, height, depth] },
        },
        {
          type: "translate",
          vector: [0, 0, floorThickness + depth / 2],
          shape: {
            type: "cuboid",
            size: [insideWidth, insideHeight, depth],
          },
        },
      ],
    }
    this.solved = true
  }

  override getOutput(): JscadOperation {
    if (!this.shellPlan) throw new Error("Enclosure shell has not been created")
    return this.shellPlan
  }

  override getConstructorParams(): [typeof this.params] {
    return [this.params]
  }

  override visualize(): GraphicsObject {
    return visualizeEnclosure({
      title: "Open-top shell",
      input: this.params.input,
      dimensions: this.params.dimensions,
    })
  }
}
