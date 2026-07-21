import { expect, test } from "bun:test"
import { createFdmEnclosure } from "../lib"

test("rejects enclosure dimensions that cannot contain the board", () => {
  expect(() =>
    createFdmEnclosure({
      board: { width: 40, height: 24, thickness: 1.6 },
      width: 42,
    }),
  ).toThrow("width must be at least 46 mm")
})

test("rejects an aperture that intersects the enclosure floor", () => {
  expect(() =>
    createFdmEnclosure({
      board: { width: 40, height: 24, thickness: 1.6 },
      apertures: [
        {
          shape: "circle",
          wall: "front",
          radius: 2,
          offset: 0,
          centerZ: 2,
        },
      ],
    }),
  ).toThrow("intersects the enclosure floor")
})
