import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function callTelegramApi(token, method, payload) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const body = JSON.stringify(payload);

  const { stdout, stderr } = await execFileAsync("curl", [
    "-sS",
    "-X",
    "POST",
    url,
    "-H",
    "Content-Type: application/json",
    "--data",
    body
  ]);

  return { stdout, stderr };
}

export async function connectTelegram({
  agentId,
  accountId,
  token,
  hideCommands = false,
  commands = []
}) {
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

  let commandsResult = null;

  if (hideCommands) {
    commandsResult = await callTelegramApi(token, "deleteMyCommands", {});
  } else if (commands.length > 0) {
    commandsResult = await callTelegramApi(token, "setMyCommands", {
      commands
    });
  }

  return {
    add: {
      stdout: addResult.stdout,
      stderr: addResult.stderr
    },
    bind: {
      stdout: bindResult.stdout,
      stderr: bindResult.stderr
    },
    commands: commandsResult
  };
}
