import { FdmEnclosureSolverDebugger } from "../site/fdm-enclosure-solver-debugger"
import { usbCPillInput } from "./inputs"

export default function UsbCPillFixture(): React.JSX.Element {
  return <FdmEnclosureSolverDebugger input={usbCPillInput} />
}
