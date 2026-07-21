import { FdmEnclosureSolverDebugger } from "../site/fdm-enclosure-solver-debugger"
import { explicitDimensionsInput } from "./inputs"

export default function ExplicitDimensionsFixture(): React.JSX.Element {
  return <FdmEnclosureSolverDebugger input={explicitDimensionsInput} />
}
