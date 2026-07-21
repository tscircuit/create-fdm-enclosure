import { expect, test } from "bun:test"
import { convertJscadPlanToGltf } from "jscad-to-gltf"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { multipleAperturesInput } from "../fixtures/inputs"
import { CreateFdmEnclosureSolver } from "../lib"

test("creates rect, circle, and pill cutouts on all four walls", async () => {
  const solver = new CreateFdmEnclosureSolver(multipleAperturesInput)
  solver.solve()

  expect(solver.solved).toBe(true)
  const output = solver.getOutput()
  expect(output.apertures).toHaveLength(4)
  expect(output.apertures.map(({ aperture }) => aperture.shape)).toEqual([
    "rect",
    "circle",
    "pill",
    "rect",
  ])
  expect(solver.visualize()).toMatchGraphicsSvg(import.meta.path)

  const plan = output.jscadPlan as Parameters<typeof convertJscadPlanToGltf>[0]
  const glb = await convertJscadPlanToGltf(plan, {
    format: "glb",
    axisTransform: "jscad_y+ -> gltf_z+",
  })
  expect(
    renderGLTFToPNGFromGLB(glb.data as ArrayBuffer, {
      backgroundColor: "#ffffff",
      grid: false,
    }),
  ).toMatchPngSnapshot(import.meta.path)
})
