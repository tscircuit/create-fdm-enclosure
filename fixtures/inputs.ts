import type { CreateFdmEnclosureInput } from "../lib"

export const usbCPillInput: CreateFdmEnclosureInput = {
  board: { width: 40, height: 24, thickness: 1.6 },
  apertures: [
    {
      shape: "pill",
      wall: "front",
      width: 9,
      height: 3.6,
      margin: 0.5,
      offset: 0,
      centerZ: 5.9,
    },
  ],
}

export const multipleAperturesInput: CreateFdmEnclosureInput = {
  board: { width: 50, height: 35, thickness: 1.6 },
  clearanceAboveBoard: 8,
  apertures: [
    {
      shape: "rect",
      wall: "front",
      width: 12,
      height: 6,
      margin: 0.4,
      offset: -11,
      centerZ: 7,
    },
    {
      shape: "circle",
      wall: "right",
      radius: 3,
      margin: 0.25,
      offset: 4,
      centerZ: 7,
    },
    {
      shape: "pill",
      wall: "back",
      width: 4,
      height: 9,
      margin: 0.3,
      offset: 12,
      centerZ: 7.5,
    },
    {
      shape: "rect",
      wall: "left",
      width: 8,
      height: 4,
      offset: -5,
      centerZ: 6,
    },
  ],
}

export const explicitDimensionsInput: CreateFdmEnclosureInput = {
  board: { width: 25, height: 20, thickness: 1.2 },
  width: 36,
  height: 31,
  depth: 14,
  wallThickness: 2.4,
  floorThickness: 3,
  boardClearance: 1.5,
  clearanceAboveBoard: 7,
  apertures: [],
}
