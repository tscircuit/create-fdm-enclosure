import { CreateFdmEnclosureSolver } from "./create-fdm-enclosure-solver"
import type { CreateFdmEnclosureInput, CreateFdmEnclosureOutput } from "./types"

export const createFdmEnclosure = (
  input: CreateFdmEnclosureInput,
): CreateFdmEnclosureOutput => {
  const solver = new CreateFdmEnclosureSolver(input)
  solver.solve()
  if (solver.failed) {
    throw new Error(solver.error ?? "FDM enclosure solver failed")
  }
  return solver.getOutput()
}
