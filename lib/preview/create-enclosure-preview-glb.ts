// NOTE: deliberately not re-exported from `lib/index.ts`. The published bundle
// is built from that entry point only, so the renderer remains a devDependency
// rather than leaking into the solver's runtime dependency graph.
import { convertCircuitJsonToGltf } from "circuit-json-to-gltf"
import type { JscadOperation } from "jscad-planner"
import { type CreateFdmEnclosureInput, createFdmEnclosure } from "../index"

export interface EnclosurePreviewGlb {
  data: ArrayBuffer
  mimeType: string
  byteLength: number
}

/**
 * Render one assembled enclosure plan through Circuit JSON's already-published
 * `cad_component.model_jscad` path.
 *
 * This is a compatibility exporter for the staged migration: current Core
 * represents the complete enclosure as a synthetic source/PCB/CAD component,
 * and published circuit-json-to-gltf already renders that shape. The solver may
 * resolve separate base/lid plans internally without requiring the durable
 * per-part Circuit JSON schema yet. Once `cad_fdm_enclosure` publishes, the
 * follow-up exporter will emit one typed record per `output.parts[]` entry.
 */
export const renderEnclosureJscadGlb = async (
  jscadPlan: JscadOperation,
): Promise<ArrayBuffer> => {
  const circuitJson: Parameters<typeof convertCircuitJsonToGltf>[0] = [
    {
      type: "source_component",
      source_component_id: "source_enclosure_preview",
      ftype: "simple_chip",
      name: "enclosure-preview",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_enclosure_preview",
      source_component_id: "source_enclosure_preview",
      center: { x: 0, y: 0 },
      width: 0,
      height: 0,
      layer: "top",
      rotation: 0,
      do_not_place: true,
      is_allowed_to_be_off_board: true,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_enclosure_preview",
      source_component_id: "source_enclosure_preview",
      pcb_component_id: "pcb_enclosure_preview",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      model_jscad: jscadPlan,
      model_unit_to_mm_scale_factor: 1,
      model_object_fit: "contain_within_bounds",
      model_origin_alignment: "bottom_center_of_component",
      anchor_alignment: "center",
      show_as_translucent_model: true,
    },
  ]

  return (await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    includeModels: true,
    boardTextureResolution: 0,
  })) as ArrayBuffer
}

/**
 * Build the GLB shown by the solver debugger using the assembled compatibility
 * plan. Base and lid remain separately available in `output.parts`; only the
 * interchange/export representation stays combined during this first stage.
 */
export const createEnclosurePreviewGlb = async (
  input: CreateFdmEnclosureInput,
): Promise<EnclosurePreviewGlb> => {
  const output = createFdmEnclosure(input)
  const data = await renderEnclosureJscadGlb(output.jscadPlan)
  return { data, mimeType: "model/gltf-binary", byteLength: data.byteLength }
}
