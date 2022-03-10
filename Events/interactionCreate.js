const Discord = require("discord.js"),
    Utils = require("../Modules/Utils");

module.exports = async (bot, interaction) => {
    const { config, lang, SlashCmds } = bot;
    // Slash Command Executing
    if (interaction.isCommand()) {
        const command = SlashCmds.find((x) => x.commandData.SlashCommand.Data.Name.toLowerCase() == interaction.commandName.toLowerCase());
        if (command && typeof command.runSlash == "function") {
            if (command.commandData.AllowedChannels) {
                if (typeof command.commandData.AllowedChannels == "string") {
                    command.commandData.AllowedChannels = [command.commandData.AllowedChannels];
                }
                var isAllowed = [],
                    ids = [];
                for (var index = 0; index < command.commandData.AllowedChannels.length; index++) {
                    var ch = Utils.findChannel(command.commandData.AllowedChannels[index], interaction.guild, "GUILD_TEXT", true)
                    if (ch) {
                        ids.push(`<#${ch.id}>`)
                        if (interaction.channel.id == ch.id) {
                            isAllowed.push(true)
                        }
                    }
                }
                if (!isAllowed.includes(true)) {
                    return interaction.reply(Utils.setupMessage({
                        configPath: lang.Presets.NonCommandChannel,
                        variables: [
                            { searchFor: /{channels}/g, replaceWith: ids.join(", ") },
                            ...Utils.userVariables(interaction.member),
                        ],
                    }, true))
                }
            }
            //Define command options
            let options =
                    interaction.options && interaction.options._hoistedOptions ? Utils.parseSlashArgs(interaction.options._hoistedOptions) : {};
            //Run slash command
            let commandUsed = interaction.commandName,
                commandData = command;
            command.runSlash(bot, interaction, options, { commandUsed, commandData, });
        } else {
            let cmd = interaction.guild.commands.cache.find(
                (x) => x.name.toLowerCase() == interaction.commandName.toLowerCase()
            );
            if (cmd) cmd.delete();
            interaction.reply({
                content: "This command no longer exists.",
                ephemeral: true,
            });
        }
    } else if (interaction.isButton()) {
        bot.emit("interactionCreate-Button", interaction);
    } else if (interaction.isSelectMenu()) {
        bot.emit("interactionCreate-SelectMenu", interaction);
    }
};
module.exports.once = false;
