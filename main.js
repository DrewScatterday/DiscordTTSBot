var AWS = require('aws-sdk');
const Discord = require('discord.js'); 
//var auth = require('./auth.json');
const Stream = require('stream');


var guildIDTimeouts = {};
const client = new Discord.Client({shards : 'auto'});
const prefix = '$'; 
const Polly = new AWS.Polly({
    region: 'us-east-1',
    accessKeyId: process.env.accessKey,
    secretAccessKey: process.env.secret
});

function getTTS(msg, text) {
    var params = {
        OutputFormat: "mp3",
        Text: text,
        TextType: "text", 
        VoiceId: "Brian"
    };

    console.log("processing command:" + text);

    Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            return err;
        }
        if (data.AudioStream instanceof Buffer) {
            try { 
                // convert audiostream to buffer 
                var bufferStream = new Stream.PassThrough();
                bufferStream.end(data.AudioStream);
                playSound(msg, bufferStream);
            }
            catch(err) {
                msg.reply("There was an error with that command, I'm sorry");
                console.log(err);
                return; 
            }
        }
    });
}

function playSound(msg, buf) {
    if (msg.member == null  || msg.member.voice == null || msg.member.voice.channel == null) { // user not in a voice channel
        msg.reply("Please join a voice channel first!");
        return;
    }

    var voiceChannel = msg.member.voice.channel;

    if (msg.guild.me.voice == null || msg.guild.me.voice.channel == null) { // bot not in voice channel 
        voiceChannel.join()
        .then(connection => {
            const dispatcher = connection.play(buf);

            dispatcher.on("finish", end => {
                console.log("Bot joined voice channel");

                // Leave voice channel after 7 minutes of inactivity
                guildIDTimeouts[msg.guild.id] = setTimeout(() => {
                    if(msg.guild.me.voice.channel)
                    {
                        msg.guild.me.voice.channel.leave();
                    }
                    delete guildIDTimeouts[msg.guild.id];
                    console.log("I left the guild " + msg.guild.id + " because I was inactive");
                  }, 7 * 60 * 1000) 
            });

        }).catch(e => { 
            console.log("Error joining voice channel");
            msg.reply("Error joining voice channel. Please make sure I have the correct role permissions to join your voice channel.")
        });
    } 

    else if(msg.member.voice.channel != msg.guild.me.voice.channel) { // bot not in the same voice channel 
        msg.reply("I'm currently in another voice channel. Please make sure I'm in your voice channel or not in a voice channel!");
    }

    else { // bot already in a voice channel
        clearTimeout(guildIDTimeouts[msg.guild.id]);

        if (msg.guild.voice.connection == null) {
            msg.reply("Sorry there was an error establishing a voice connection, please try again or try disconnecting me from the voice channel.");
            return;
        }

        const dispatcher = msg.guild.voice.connection.play(buf);
        
        dispatcher.on("finish", end => {
            console.log("Bot was already in voice channel");
            
            // Leave voice channel after 7 minutes of inactivity
            guildIDTimeouts[msg.guild.id] = setTimeout(() => {
                if(msg.guild.me.voice.channel)
                {
                    msg.guild.me.voice.channel.leave();
                }
                delete guildIDTimeouts[msg.guild.id];
                console.log("I left the guild " + msg.guild.id + " because I was inactive");
              }, 7 * 60 * 1000) 
        });
        
        dispatcher.on('error', err => {
            console.log("Error playing into voice channel:");
            console.log(err);
            msg.reply("Sorry there was an error playing that command, please try again or try disconnecting me from the voice channel.");
        });
    }  
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
  
client.on('message', async msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return; 
    
    // Handle one word commands 
    if (!msg.content.includes(' ')) {
        var command = msg.content.slice(prefix.length).trim();
        if (command === 'beatbox') {
            try {
                getTTS(msg, "my beatbox goes ᴶᴳᴾ,ᴶᴳᴰ,ᴶᴳᴾ,ᴶᴳᵀ,ᴶᴳᴾ,ᴶᴳᴰ,ᴶᴳᴾ,ᴶᴳᵀ,ᴶᴳᴾ,ᴶᴳᴰ,ᴶᴳᴾ,ᴶᴳᵀ,ᴶᴳᴾ,ᴶᴳᴰ,ᴶᴳᴾ,ᴶᴳᵀᴷᴶᴷᴶᴷᴶᴷᴶ");
            }
            catch(err) {
                msg.reply("There was an error with that command, I'm sorry");
                console.log(err);
            }
        }
        else if (command === 'manual') {
            msg.reply("https://docs.google.com/document/d/1qLKdc3QArtn6PVuGf42EfoMuzvLE_ykWwU1RViEcrbU/edit");
        }
        else if (command === 'stop') {
            if (msg.member.voice.channel) {
                if (msg.guild.me.voice.channel != null && msg.guild.voice.connection != null && msg.guild.voice.connection.dispatcher != null) {
                    msg.guild.voice.connection.dispatcher.destroy();
                    msg.guild.voice.connection.disconnect();
                    if (msg.guild.id in guildIDTimeouts) {
                        delete guildIDTimeouts[msg.guild.id];
                    }
                }
            }
        }
        else if (command === 'invite') {
            var embed = new Discord.MessageEmbed()
            .setDescription(`
            If you'd like to send this bot to your friends use this top.gg [link](https://top.gg/bot/793354487699865611)
            `)
            msg.channel.send(embed);
        }
        else if (command === 'support') {
            var embed = new Discord.MessageEmbed()
            .setDescription(`
            If you enjoy this bot and want to support it please upvote it on [top.gg](https://top.gg/bot/793354487699865611/vote)
            `)
            msg.channel.send(embed);
        }
        else if (command === 'help') {
            var embed = new Discord.MessageEmbed()
            .setAuthor("Supported commands")
            .setThumbnail(client.user.displayAvatarURL)
            .setDescription(`
            - **$help** - Displays the help menu
            - **$manual** - Displays a TTS Manual Google Doc for using Brian. Made by gshredder
            - **$stop** - Stops Brian while he is speaking
            - **$tts <sentence to be read>** - Get Brian to read a sentence
            - **$beatbox** - Sick beatz 
            - **$invite** - A bot invite link to share with your friends
            - **$support** - Support the bot by upvoting it on top.gg 
            `)
            msg.channel.send(embed);
        }
        return; 
    }

    // Handle tts command with arguments
    var delimPos = msg.content.indexOf(' ');
    if (delimPos <= 0) {
        msg.reply("There was an error with that command, I'm sorry");
        return;
    }

    var command = msg.content.substr(0, delimPos).trim();
    var sentence = msg.content.substr(delimPos + 1).trim();
    command = command.slice(prefix.length);

    if (command === 'tts') {
        try {
            getTTS(msg, sentence);
        }
        catch(err) {
            msg.reply("There was an error with that command, I'm sorry");
            console.log(err);
            return; 
        }
    }
});

client.login(process.env.token);


