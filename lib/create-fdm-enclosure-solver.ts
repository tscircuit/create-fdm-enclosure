import {
  BasePipelineSolver,
  definePipelineStep,
  type PipelineStep,
} from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import { ComposeEnclosureSolver } from "./solvers/compose-enclosure-solver"
import { CreateApertureCutoutsSolver } from "./solvers/create-aperture-cutouts-solver"
import { CreateEnclosureShellSolver } from "./solvers/create-enclosure-shell-solver"
import { ResolveEnclosureDimensionsSolver } from "./solvers/resolve-enclosure-dimensions-solver"
import type { CreateFdmEnclosureInput, CreateFdmEnclosureOutput } from "./types"
import { visualizeEnclosure } from "./visualize-enclosure"

const requireStage = <T>(stage: T | undefined, name: string): T => {
  if (!stage) throw new Error(`${name} has not completed`)
  return stage
}

export class CreateFdmEnclosureSolver extends BasePipelineSolver<CreateFdmEnclosureInput> {
  resolveEnclosureDimensionsSolver?: ResolveEnclosureDimensionsSolver
  createEnclosureShellSolver?: CreateEnclosureShellSolver
  createApertureCutoutsSolver?: CreateApertureCutoutsSolver
  composeEnclosureSolver?: ComposeEnclosureSolver

  override pipelineDef: PipelineStep<any>[] = [
    definePipelineStep(
      "resolveEnclosureDimensionsSolver",
      ResolveEnclosureDimensionsSolver,
      (pipeline: CreateFdmEnclosureSolver) => [pipeline.inputProblem],
    ),
    definePipelineStep(
      "createEnclosureShellSolver",
      CreateEnclosureShellSolver,
      (pipeline: CreateFdmEnclosureSolver) => [
        {
          input: pipeline.inputProblem,
          dimensions: requireStage(
            pipeline.resolveEnclosureDimensionsSolver,
            "resolveEnclosureDimensionsSolver",
          ).getOutput(),
        },
      ],
    ),
    definePipelineStep(
      "createApertureCutoutsSolver",
      CreateApertureCutoutsSolver,
      (pipeline: CreateFdmEnclosureSolver) => [
        {
          input: pipeline.inputProblem,
          dimensions: requireStage(
            pipeline.resolveEnclosureDimensionsSolver,
            "resolveEnclosureDimensionsSolver",
          ).getOutput(),
        },
      ],
    ),
    definePipelineStep(
      "composeEnclosureSolver",
      ComposeEnclosureSolver,
      (pipeline: CreateFdmEnclosureSolver) => [
        {
          input: pipeline.inputProblem,
          dimensions: requireStage(
            pipeline.resolveEnclosureDimensionsSolver,
            "resolveEnclosureDimensionsSolver",
          ).getOutput(),
          shellPlan: requireStage(
            pipeline.createEnclosureShellSolver,
            "createEnclosureShellSolver",
          ).getOutput(),
          apertureCutouts: requireStage(
            pipeline.createApertureCutoutsSolver,
            "createApertureCutoutsSolver",
          ).getOutput(),
        },
      ],
    ),
  ]

  override getConstructorParams(): [CreateFdmEnclosureInput] {
    return [this.inputProblem]
  }

  override getOutput(): CreateFdmEnclosureOutput {
    if (!this.solved) throw new Error("FDM enclosure solver has not completed")
    return {
      dimensions: requireStage(
        this.resolveEnclosureDimensionsSolver,
        "resolveEnclosureDimensionsSolver",
      ).getOutput(),
      apertures: requireStage(
        this.createApertureCutoutsSolver,
        "createApertureCutoutsSolver",
      ).getOutput(),
      jscadPlan: requireStage(
        this.composeEnclosureSolver,
        "composeEnclosureSolver",
      ).getOutput(),
    }
  }

  override initialVisualize(): GraphicsObject | null {
    return null
  }

  override finalVisualize(): GraphicsObject {
    const output = this.getOutput()
    return visualizeEnclosure({
      title: "Final FDM enclosure",
      input: this.inputProblem,
      dimensions: output.dimensions,
      processedApertureCount: output.apertures.length,
    })
  }
}
