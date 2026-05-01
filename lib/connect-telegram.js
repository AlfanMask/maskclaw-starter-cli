import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function connectTelegram({ agentId, accountId, token }) {
  const addArgs = [
    "channels",
    "add",
    "--channel",
    "telegram",
    "--account",
    accountId,
    "--token",
    token
  ];

  const addResult = await execFileAsync("openclaw", addArgs);

  const bindArgs = [
    "agents",
    "bind",
    "--agent",
    agentId,
    "--bind",
    `telegram:${accountId}`
  ];

  const bindResult = await execFileAsync("openclaw", bindArgs);

  return {
    add: {
      stdout: addResult.stdout,
      stderr: addResult.stderr
    },
    bind: {
      stdout: bindResult.stdout,
      stderr: bindResult.stderr
    }
  };
}
