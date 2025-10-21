require('dotenv').config();
const stringSimilarity = require('string-similarity');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
    client.user.setActivity('czekam na !hello', { type: 0 });
});

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.channel.send('Cześć! Jestem aktywny.');
    }
});

// --- rozpoznawanie powitań skierowanych do bota ---
client.on('messageCreate', message => {
    if (message.author.bot) return;

    const text = message.content.toLowerCase();
    const greetings = ['cześć', 'czesc', 'hej', 'siema', 'elo', 'yo', 'witam', 'hello', 'hi'];
    const bestMatch = stringSimilarity.findBestMatch(text, greetings);

    if (bestMatch.bestMatch.rating > 0.5 && (text.includes('bot') || text.includes('bocik') || text.includes('bocie'))) {
        message.reply('No siema! 😎');
    }
});

client.login(process.env.TOKEN);
