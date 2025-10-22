require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const stringSimilarity = require('string-similarity');

// --- Express, żeby Render nie usypiał bota ---
const app = express();
app.get('/', (req, res) => res.send('Bot działa 🚀'));
app.listen(3000, () => console.log('🌐 Serwer webowy uruchomiony na porcie 3000'));

// --- ID kanału, gdzie bot wysyła gm/gn ---
const CHANNEL_ID = '1417097435209142342';

// --- Klient Discorda ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ✅ Logowanie
client.once('ready', async () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
  client.user.setActivity('rozmowy z ludźmi 💬', { type: 0 });
  scheduleMessages();
});

// --- Komendy i reakcje ---
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const text = message.content.toLowerCase();

  // Komenda testowa GM/GN
  if (text === '!testgmgn') {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return message.reply('❌ Nie mogę znaleźć kanału.');
      await channel.send('🌞 gm wszystkim! (test)');
      await channel.send('🌙 gn, dobranoc wszystkim! (test)');
      message.reply('✅ Wysłałem testowe wiadomości GM i GN.');
    } catch (err) {
      console.error(err);
      message.reply('⚠️ Błąd przy wysyłaniu wiadomości.');
    }
    return;
  }

  // Reakcje i powitania
  const triggers = {
    'co robisz bocik': 'Siedzę na serwerze i obserwuję czat 😎',
    'lubisz mnie bocik': 'Oczywiście że lubię 💕',
    'kim jestes bocik': 'Jestem prostym botem, ale z wielkim sercem 💖',
    'dziekuje bocik': 'Nie ma za co! 💫',
    'dobranoc bocik': 'Słodkich snów 🌙',
    'skibidi toilet': 'https://tenor.com/p9BpiQov0bB.gif'
  };

  const bestMatch = stringSimilarity.findBestMatch(text, Object.keys(triggers));
  if (bestMatch.bestMatch.rating > 0.5) {
    return message.reply(triggers[bestMatch.bestMatch.target]);
  }

  const greetings = ['cześć', 'czesc', 'hej', 'heja', 'siema', 'elo', 'yo', 'witam', 'hello', 'hi', 'siemka', 'siemano'];
  const greetMatch = stringSimilarity.findBestMatch(text, greetings);
  if (greetMatch.bestMatch.rating > 0.5 && /(bot|bocik|bocie)/i.test(text)) {
    const replies = [
      'Hejka <3',
      'No siema!',
      'Siemanko, ciebie widzieć to przyjemność 😁',
      'Bocik melduje się na służbie 💪',
      'Witam serdecznie 💕'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    message.reply(randomReply);
  }

  // Komenda do ról
  if (message.content === '!role') {
    const msg1 = await message.channel.send('1️⃣ Samochodziarz');
    await msg1.react('🚗');

    const msg2 = await message.channel.send('2️⃣ Montażysta');
    await msg2.react('🎬');

    const msg3 = await message.channel.send('3️⃣ Rocket League');
    await msg3.react('🚀');
  }
});

// --- Reakcje ---
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);

  const roles = {
    '🚗': 'Samochodziarz',
    '🎬': 'Montażysta',
    '🚀': 'Rocket League'
  };

  const roleName = roles[reaction.emoji.name];
  if (roleName && reaction.message.content.includes(roleName)) {
    const role = guild.roles.cache.find(r => r.name === roleName);
    if (role) await member.roles.add(role);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);

  const roles = {
    '🚗': 'Samochodziarz',
    '🎬': 'Montażysta',
    '🚀': 'Rocket League'
  };

  const roleName = roles[reaction.emoji.name];
  if (roleName && reaction.message.content.includes(roleName)) {
    const role = guild.roles.cache.find(r => r.name === roleName);
    if (role) await member.roles.remove(role);
  }
});

// --- Harmonogram GM / GN ---
function scheduleMessages() {
  const now = new Date();
  const timeTo = (h, m) => {
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    return target - now;
  };

  setTimeout(() => sendMessage('🌞 gm wszystkim!'), timeTo(9, 30));
  setTimeout(() => sendMessage('🌙 gn, dobranoc wszystkim!'), timeTo(0, 0));
}

async function sendMessage(text) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.error('❌ Nie mogę znaleźć kanału.');
    await channel.send(text);
    console.log(`[AUTO] Wysłałem: ${text}`);
  } catch (err) {
    console.error('Błąd przy automatycznej wiadomości:', err);
  }
}

client.login(process.env.TOKEN);
