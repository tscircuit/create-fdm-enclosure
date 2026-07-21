import { expect, test } from "bun:test"
import { explicitDimensionsInput } from "../fixtures/inputs"
import { CreateFdmEnclosureSolver } from "../lib"

test("preserves valid explicit enclosure dimensions", () => {
  const solver = new CreateFdmEnclosureSolver(explicitDimensionsInput)
  solver.solve()

  expect(solver.getOutput().dimensions).toEqual({
    width: 36,
    height: 31,
    depth: 14,
    wallThickness: 2.4,
    floorThickness: 3,
    boardClearance: 1.5,
    clearanceAboveBoard: 7,
  })
  expect(solver.getOutput().apertures).toEqual([])
  expect(solver.visualize()).toMatchGraphicsSvg(import.meta.path)
})
