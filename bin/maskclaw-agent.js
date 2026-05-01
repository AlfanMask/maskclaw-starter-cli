#!/usr/bin/env node

import { Command } from "commander";
import { createAgent } from "../lib/create-agent.js";
import { registerAgent } from "../lib/register-agent.js";
import { copyAuth } from "../lib/copy-auth.js";
import { connectTelegram } from "../lib/connect-telegram.js";

const program = new Command();

program
  .name("maskclaw-agent")
  .description("CLI buat scaffold agent OpenClaw")
  .version("0.1.0");

program
  .command("list-templates")
  .description("Lihat preset/addon yang tersedia")
  .action(() => {
    console.log("Presets:");
    console.log("- customer-support");
    console.log("");
    console.log("Addons:");
    console.log("- gog");
  });

program
  .command("new")
  .description("Bikin agent baru")
  .argument("<agentId>", "ID agent, misal toko-budi")
  .option("--preset <preset>", "preset agent", "customer-support")
  .option("--name <name>", "nama agent", "MaskClaw Agent")
  .option("--owner <owner>", "nama owner/customer", "Customer")
  .option("--persona <persona>", "gaya/kepribadian agent", "helpful and friendly")
  .option("--emoji <emoji>", "emoji agent", "🤖")
  .option("--model <model>", "model yang dipakai", "openai-codex")
  .option("--auth-mode <authMode>", "mode auth agent", "copy-main")
  .option("--register", "langsung daftarkan ke OpenClaw setelah scaffold")
  .option("--copy-auth", "langsung copy auth dari main setelah register")
  .option("--auth-from <sourceAgentId>", "agent sumber auth", "main")
.action(async (agentId, options) => {
    try {
      if (options.copyAuth && !options.register) {
        console.warn(
          'Warning: --copy-auth dipakai tanpa --register. Pastikan agent target di OpenClaw sudah ada.'
        );
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

      console.log("Agent berhasil dibuat.");
      console.log("Folder:", created.outputDir);

      if (options.register) {
        const registered = await registerAgent({ agentId });

        console.log("");
        console.log("Agent berhasil didaftarkan ke OpenClaw.");
        console.log("Workspace:", registered.workspacePath);

        if (registered.stdout) {
          console.log("\nstdout:");
          console.log(registered.stdout);
        }

        if (registered.stderr) {
          console.log("\nstderr:");
          console.log(registered.stderr);
        }
      }

      if (options.copyAuth) {
        const copied = await copyAuth({
          agentId,
          sourceAgentId: options.authFrom
        });

        console.log("");
        console.log("Auth berhasil dicopy.");
        console.log("From:", copied.sourcePath);
        console.log("To:", copied.targetPath);
      }
    } catch (error) {
      console.error("Gagal bikin agent.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("register")
  .description("Daftarkan agent hasil scaffold ke OpenClaw")
  .argument("<agentId>", "ID agent yang mau didaftarkan")
  .action(async (agentId) => {
    try {
      const result = await registerAgent({ agentId });

      console.log("Agent berhasil didaftarkan ke OpenClaw.");
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
      console.error("Gagal register agent.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("copy-auth")
  .description("Copy auth profile dari agent lain ke agent target")
  .argument("<agentId>", "ID agent target")
  .option("--from <sourceAgentId>", "agent sumber auth", "main")
  .action(async (agentId, options) => {
    try {
      const result = await copyAuth({
        agentId,
        sourceAgentId: options.from
      });

      console.log("Auth berhasil dicopy.");
      console.log("From:", result.sourcePath);
      console.log("To:", result.targetPath);
    } catch (error) {
      console.error("Gagal copy auth.");
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command("connect-telegram")
  .description("Hubungkan agent ke bot Telegram")
  .argument("<agentId>", "ID agent target")
  .option("--account <accountId>", "account id telegram")
  .option("--token <token>", "bot token telegram")
  .action(async (agentId, options) => {
    try {
      if (!options.account || !options.token) {
        throw new Error("Butuh --account dan --token");
      }

      const result = await connectTelegram({
        agentId,
        accountId: options.account,
        token: options.token
      });

      console.log("Telegram account berhasil ditambahkan dan dibind.");

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
    } catch (error) {
      console.error("Gagal connect Telegram.");
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();
