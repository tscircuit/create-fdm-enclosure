import { expect, test } from "bun:test"
import { CreateFdmEnclosureSolver } from "../lib"

test("CreateFdmEnclosureSolver has a stable solver name", () => {
  expect(CreateFdmEnclosureSolver.solverName).toBe("CreateFdmEnclosureSolver")
})
