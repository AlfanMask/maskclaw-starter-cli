#!/usr/bin/env node

import { Command } from "commander";
import { createAgent } from "../lib/create-agent.js";
import { registerAgent } from "../lib/register-agent.js";
import { copyAuth } from "../lib/copy-auth.js";
import { connectTelegram } from "../lib/connect-telegram.js";

const program = new Command();

function parseTelegramCommands(input) {
  if (!input) return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [command, ...descriptionParts] = item.split(":");
      return {
        command: command?.trim(),
        description: descriptionParts.join(":").trim()
      };
    })
    .filter((item) => item.command && item.description);
}

program
  .name("maskclaw-agent")
  .description("Professional CLI for provisioning OpenClaw agents")
  .version("0.1.0");

program
  .command("list-templates")
  .description("List available presets and addons")
  .action(() => {
    console.log("Presets:");
    console.log("- customer-support");
    console.log("");
    console.log("Addons:");
    console.log("- gog");
  });

program
  .command("new")
  .description("Create a new agent scaffold")
  .argument("<agentId>", "Agent ID, for example: toko-budi")
  .option("--preset <preset>", "Agent preset", "customer-support")
  .option("--name <name>", "Agent display name", "MaskClaw Agent")
  .option("--owner <owner>", "Customer or owner name", "Customer")
  .option("--persona <persona>", "Agent personality or tone", "helpful and friendly")
  .option("--emoji <emoji>", "Agent emoji", "🤖")
  .option("--model <model>", "Preferred model", "openai-codex")
  .option("--auth-mode <authMode>", "Authentication mode", "copy-main")
  .option("--register", "Register the agent in OpenClaw after scaffolding")
  .option("--copy-auth", "Copy authentication from another agent after registration")
  .option("--auth-from <sourceAgentId>", "Source agent for authentication copy", "main")
  .option("--telegram-account <accountId>", "Telegram account ID to attach during provisioning")
  .option("--telegram-token <token>", "Telegram bot token to attach during provisioning")
  .option("--telegram-hide-commands", "Remove Telegram bot commands so users only see chat")
  .option(
    "--telegram-commands <commands>",
    "Comma-separated Telegram commands in the format command:description,command2:description2"
  )
  .action(async (agentId, options) => {
    try {
      if (options.copyAuth && !options.register) {
        console.warn(
          "Warning: --copy-auth was used without --register. Make sure the target agent already exists in OpenClaw."
        );
      }

      if (options.telegramToken && !options.telegramAccount) {
        throw new Error("--telegram-account is required when --telegram-token is provided.");
      }

      const created = await createAgent({
        agentId,
        name: options.name,
        preset: options.preset,
        owner: options.owner,
        persona: options.persona,
        emoji: options.emoji,
        model: options.model,
        authMode: options.authMode
      });

      console.log("Agent scaffold created successfully.");
      console.log("Folder:", created.outputDir);

      if (options.register) {
        const registered = await registerAgent({ agentId });

        console.log("");
        console.log("Agent registered in OpenClaw successfully.");
        console.log("Workspace:", registered.workspacePath);

        if (registered.stdout) {
          console.log("\nregister stdout:");
          console.log(registered.stdout);
        }

        if (registered.stderr) {
          console.log("\nregister stderr:");
          console.log(registered.stderr);
        }
      }

      if (options.copyAuth) {
        const copied = await copyAuth({
          agentId,
          sourceAgentId: options.authFrom
        });

        console.log("");
        console.log("Authentication copied successfully.");
        console.log("From:", copied.sourcePath);
        console.log("To:", copied.targetPath);
      }

      if (options.telegramAccount && options.telegramToken) {
        const telegramCommands = parseTelegramCommands(options.telegramCommands);

        const telegram = await connectTelegram({
          agentId,
          accountId: options.telegramAccount,
          token: options.telegramToken,
          hideCommands: options.telegramHideCommands,
          commands: telegramCommands
        });

        console.log("");
        console.log("Telegram account connected successfully.");

        if (telegram.add.stdout) {
          console.log("\ntelegram add stdout:");
          console.log(telegram.add.stdout);
        }

        if (telegram.add.stderr) {
          console.log("\ntelegram add stderr:");
          console.log(telegram.add.stderr);
        }

        if (telegram.bind.stdout) {
          console.log("\ntelegram bind stdout:");
          console.log(telegram.bind.stdout);
        }

        if (telegram.bind.stderr) {
          console.log("\ntelegram bind stderr:");
          console.log(telegram.bind.stderr);
        }

        if (telegram.commands?.stdout) {
          console.log("\ntelegram commands stdout:");
          console.log(telegram.commands.stdout);
        }

        if (telegram.commands?.stderr) {
          console.log("\ntelegram commands stderr:");
          console.log(telegram.commands.stderr);
        }
      }
    } catch (error) {
      console.error("Failed to create agent.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("register")
  .description("Register an existing scaffolded agent in OpenClaw")
  .argument("<agentId>", "Agent ID to register")
  .action(async (agentId) => {
    try {
      const result = await registerAgent({ agentId });

      console.log("Agent registered successfully.");
      console.log("Workspace:", result.workspacePath);

      if (result.stdout) {
        console.log("\nstdout:");
        console.log(result.stdout);
      }

      if (result.stderr) {
        console.log("\nstderr:");
        console.log(result.stderr);
      }
    } catch (error) {
      console.error("Failed to register agent.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("copy-auth")
  .description("Copy authentication profiles from another agent")
  .argument("<agentId>", "Target agent ID")
  .option("--from <sourceAgentId>", "Source agent ID", "main")
  .action(async (agentId, options) => {
    try {
      const result = await copyAuth({
        agentId,
        sourceAgentId: options.from
      });

      console.log("Authentication copied successfully.");
      console.log("From:", result.sourcePath);
      console.log("To:", result.targetPath);
    } catch (error) {
      console.error("Failed to copy authentication.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("connect-telegram")
  .description("Connect an agent to a Telegram bot")
  .argument("<agentId>", "Target agent ID")
  .option("--account <accountId>", "Telegram account ID")
  .option("--token <token>", "Telegram bot token")
  .option("--hide-commands", "Remove Telegram bot commands from the bot menu")
  .option(
    "--commands <commands>",
    "Comma-separated Telegram commands in the format command:description,command2:description2"
  )
  .action(async (agentId, options) => {
    try {
      if (!options.account || !options.token) {
        throw new Error("Both --account and --token are required.");
      }

      const result = await connectTelegram({
        agentId,
        accountId: options.account,
        token: options.token,
        hideCommands: options.hideCommands,
        commands: parseTelegramCommands(options.commands)
      });

      console.log("Telegram account connected and bound successfully.");

      if (result.add.stdout) {
        console.log("\nadd stdout:");
        console.log(result.add.stdout);
      }

      if (result.add.stderr) {
        console.log("\nadd stderr:");
        console.log(result.add.stderr);
      }

      if (result.bind.stdout) {
        console.log("\nbind stdout:");
        console.log(result.bind.stdout);
      }

      if (result.bind.stderr) {
        console.log("\nbind stderr:");
        console.log(result.bind.stderr);
      }

      if (result.commands?.stdout) {
        console.log("\ncommands stdout:");
        console.log(result.commands.stdout);
      }

      if (result.commands?.stderr) {
        console.log("\ncommands stderr:");
        console.log(result.commands.stderr);
      }
    } catch (error) {
      console.error("Failed to connect Telegram.");
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();
