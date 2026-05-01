import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function registerAgent({ agentId }) {
  const workspacePath = path.resolve("output", agentId);

  const { stdout, stderr } = await execFileAsync("openclaw", [
    "agents",
    "add",
    agentId,
    "--workspace",
    workspacePath
  ]);

  return {
    workspacePath,
    stdout,
    stderr
  };
}
