const DiscordSmith = require('discord.js');
const smithmta = require('gamedig');
const smithconfig = require('./config.json');

const smithbot = new DiscordSmith.Client({ intents: [DiscordSmith.Intents.FLAGS.GUILDS] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { config } = require('process');

const commands = [
	new SlashCommandBuilder().setName('server').setDescription('Dominican Mafia RP'),
    new SlashCommandBuilder().setName('player').setDescription('Jugadores en juego'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(smithconfig.token);

smithbot.once('ready', () => {
	console.log(`Logged : ${smithbot.user.tag}`);
    setInterval(() => {
        smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then((state) => {
            smithbot.user.setActivity(`DMRP - ${state.raw.numplayers}/${state.maxplayers}`);
        }).catch(err => {
            console.log(err);
        });
    }, 5000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(smithbot.user.id, smithconfig.guildId),
                { body: commands },
            );
    
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});


smithbot.on('interactionCreate', async smithmsg => {
	if (!smithmsg.isCommand()) return;

	const { commandName } = smithmsg;

	if (commandName === 'server') {
		smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var smithembed = new DiscordSmith.MessageEmbed()
            .setTitle(state.name)
            .setColor(`BLUE`)
            .addField(`Mapa :`,` - RolePlay`,true)
            .addField(`Modo :`,` - ${state.raw.gametype}`,true)
            .addField(`Desarrollador :`,` - l0udvinter#0001`,true)
            .addField(`Jugadores :`,` - ${state.raw.numplayers}/${state.maxplayers}`,true)
            .addField(`Ping:`,` - ${state.ping}ms`,true)
            .addField(`IP:`,` - ${state.connect}`,true)
            .setTimestamp()
            .setFooter(`Pedido por: ${smithmsg.member.user.tag}`,smithmsg.member.user.avatarURL());

            await smithmsg.reply({ embeds: [smithembed] });
        }).catch(err => {
            console.log(err);
        });
	} 
});

smithbot.login(smithconfig.token);