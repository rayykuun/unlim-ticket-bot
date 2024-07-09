const { Client, GatewayIntentBits, WebhookClient } = require("discord.js");
const { CommandKit } = require("commandkit");
const path = require("path");
const { token } = require("./config.json");
const database = require("./database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  // validationsPath: path.join(__dirname, "validations"),
  devGuildIds: ["1188598186500173844"],
  devUserIds: ["283322500325179394"],
  devRoleIds: ["1188598586544504843"],
  skipBuiltInValidations: true,
  bulkRegister: true,
});

// Webhook für Fehlermeldungen
const errorWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/1259523078736580748/bY-QcVHRKOck9t4rqqL8mGp37ip0TUPBGvnEyLVwaGmLfBRzOnYrb1igTO7layGtSFkF",
});

// Globaler Error Handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  errorWebhook.send(`Unhandled Rejection: ${reason}`);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  errorWebhook.send(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

client.on("error", (error) => {
  console.error("Discord Client Error:", error);
  errorWebhook.send(`Discord Client Error: ${error.message}`);
});

database.connect();
client.login(token);
