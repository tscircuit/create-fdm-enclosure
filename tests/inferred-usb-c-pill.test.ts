import { expect, test } from "bun:test"
import { convertJscadPlanToGltf } from "jscad-to-gltf"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { usbCPillInput } from "../fixtures/inputs"
import { CreateFdmEnclosureSolver } from "../lib"

test("infers an enclosure and creates a front USB-C pill cutout", async () => {
  const solver = new CreateFdmEnclosureSolver(usbCPillInput)
  solver.solve()

  expect(solver.solved).toBe(true)
  const output = solver.getOutput()
  expect(output.dimensions).toEqual({
    width: 46,
    height: 30,
    depth: 10.2,
    wallThickness: 2,
    floorThickness: 2,
    boardClearance: 1,
    clearanceAboveBoard: 6,
  })
  expect(output.apertures).toHaveLength(1)
  expect(output.apertures[0]).toMatchObject({
    width: 10,
    height: 4.6,
    cutDepth: 3,
  })
  expect(output.jscadPlan).toMatchObject({ type: "subtract" })
  expect(solver.visualize()).toMatchGraphicsSvg(import.meta.path)

  const plan = output.jscadPlan as Parameters<typeof convertJscadPlanToGltf>[0]
  const glb = await convertJscadPlanToGltf(plan, {
    format: "glb",
    axisTransform: "jscad_y+ -> gltf_z+",
  })
  expect(glb.byteLength).toBeGreaterThan(1_000)
  expect(
    renderGLTFToPNGFromGLB(glb.data as ArrayBuffer, {
      backgroundColor: "#ffffff",
      grid: false,
    }),
  ).toMatchPngSnapshot(import.meta.path)
})
