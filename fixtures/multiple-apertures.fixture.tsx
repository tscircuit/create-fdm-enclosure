import { FdmEnclosureSolverDebugger } from "../site/fdm-enclosure-solver-debugger"
import { multipleAperturesInput } from "./inputs"

export default function MultipleAperturesFixture(): React.JSX.Element {
  return <FdmEnclosureSolverDebugger input={multipleAperturesInput} />
}
