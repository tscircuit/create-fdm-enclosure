import { expect, type MatcherResult } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import looksSame from "looks-same"

const toMatchPngSnapshot = async function (
  this: unknown,
  receivedValue: Buffer | Uint8Array | Promise<Buffer | Uint8Array>,
  testPath: string,
  snapshotName?: string,
): Promise<MatcherResult> {
  const received = await receivedValue
  const testBasePath = testPath.replace(/\.test\.tsx?$/, "")
  const snapshotDirectory = path.join(
    path.dirname(testBasePath),
    "__snapshots__",
  )
  const fileName = snapshotName
    ? `${snapshotName}.snap.png`
    : `${path.basename(testBasePath)}.snap.png`
  const snapshotPath = path.join(snapshotDirectory, fileName)
  fs.mkdirSync(snapshotDirectory, { recursive: true })

  if (!fs.existsSync(snapshotPath)) {
    fs.writeFileSync(snapshotPath, received)
    return {
      pass: true,
      message: () => `Created PNG snapshot at ${snapshotPath}`,
    }
  }

  const existing = fs.readFileSync(snapshotPath)
  const comparison = await looksSame(Buffer.from(received), existing, {
    strict: false,
    tolerance: 2,
  })
  const shouldUpdate =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env.BUN_UPDATE_SNAPSHOTS)

  if (shouldUpdate) {
    fs.writeFileSync(snapshotPath, received)
    return { pass: true, message: () => "Updated PNG snapshot" }
  }
  if (comparison.equal) {
    return { pass: true, message: () => "PNG snapshot matches" }
  }

  const diffPath = snapshotPath.replace(/\.snap\.png$/, ".diff.png")
  await looksSame.createDiff({
    reference: existing,
    current: Buffer.from(received),
    diff: diffPath,
    highlightColor: "#ff00ff",
  })
  return {
    pass: false,
    message: () => `PNG snapshot differs; diff written to ${diffPath}`,
  }
}

expect.extend({ toMatchPngSnapshot: toMatchPngSnapshot as any })

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchPngSnapshot(
      testPath: string,
      snapshotName?: string,
    ): Promise<MatcherResult>
  }
}
