import fs from "fs/promises";
import path from "path";
import os from "os";

export async function copyAuth({ agentId, sourceAgentId = "main" }) {
  const home = os.homedir();

  const sourcePath = path.join(
    home,
    ".openclaw",
    "agents",
    sourceAgentId,
    "agent",
    "auth-profiles.json"
  );

  const targetDir = path.join(
    home,
    ".openclaw",
    "agents",
    agentId,
    "agent"
  );

  const targetPath = path.join(targetDir, "auth-profiles.json");

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  return {
    sourcePath,
    targetPath
  };
}
