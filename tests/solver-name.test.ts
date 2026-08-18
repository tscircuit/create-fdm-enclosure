import { expect, test } from "bun:test"
import { CreateFdmEnclosureSolver } from "../lib"

test("CreateFdmEnclosureSolver has a stable solver name", () => {
  const solver = Object.create(
    CreateFdmEnclosureSolver.prototype,
  ) as CreateFdmEnclosureSolver

  expect(solver.getSolverName()).toBe("CreateFdmEnclosureSolver")
})
