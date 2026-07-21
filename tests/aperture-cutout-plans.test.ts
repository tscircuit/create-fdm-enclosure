import { expect, test } from "bun:test"
import { createApertureCutoutPlan } from "../lib"

const dimensions = {
  width: 46,
  height: 30,
  depth: 12,
  wallThickness: 2,
  floorThickness: 2,
  boardClearance: 1,
  clearanceAboveBoard: 6,
}

test("an aperture owns its shape, orientation, and wall placement plan", () => {
  const pill = createApertureCutoutPlan({
    dimensions,
    aperture: {
      shape: "pill",
      wall: "front",
      width: 9,
      height: 3.6,
      margin: 0.5,
      offset: 4,
      centerZ: 6,
    },
  })
  const circle = createApertureCutoutPlan({
    dimensions,
    aperture: {
      shape: "circle",
      wall: "right",
      radius: 2.5,
      offset: -3,
      centerZ: 7,
    },
  })

  expect(pill.jscadPlan).toMatchObject({
    type: "translate",
    vector: [4, -14, 6],
    shape: { type: "union" },
  })
  expect(circle.jscadPlan).toMatchObject({
    type: "translate",
    vector: [22, -3, 7],
    shape: {
      type: "rotate",
      angles: [0, Math.PI / 2, 0],
      shape: { type: "cylinder", radius: 2.5, height: 3 },
    },
  })
})
