var AWS = require('aws-sdk');
const Discord = require('discord.js'); 
var auth = require('./testingauth.json');
const Stream = require('stream');


var voiceInactiveDict = {};
const client = new Discord.Client();
const prefix = '!'; 
const Polly = new AWS.Polly({
    region: 'us-east-1',
    accessKeyId: auth.accessKey,
    secretAccessKey: auth.secret
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
            // convert audiostream to buffer 
            var bufferStream = new Stream.PassThrough();
            bufferStream.end(data.AudioStream)
            playSound(msg, bufferStream);
        }
    });
}

function playSound(msg, buf) {
    var voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) { // user not in a voice channel
        msg.reply("Please join a voice channel first!");
        return;
    }

    if (!msg.guild.me.voice.channel) { // bot not in voice channel 

        voiceChannel.join()
        .then(connection => {
            const dispatcher = connection.play(buf);

            dispatcher.on("finish", end => {
                console.log("Bot joined voice channel");

                // Store voice channel msg.guild.me.voice.channel object and current timestamp in a dict
                voiceInactiveDict[msg.guild.me.voice.channel] = new Date();
                console.log(voiceInactiveDict);
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
        if (msg.guild.voice.connection == null) {
            msg.reply("Sorry there was an error establishing a voice connection, please try again or try disconnecting me from the voice channel.");
            return;
        }

        const dispatcher = msg.guild.voice.connection.play(buf);
        
        dispatcher.on("finish", end => {
            console.log("Bot was already in voice channel");
            
            // Store voice channel msg.guild.me.voice.channel object and current timestamp in a dict
            voiceInactiveDict[msg.guild.me.voice.channel] = new Date();
            console.log(voiceInactiveDict);
        });
        
        dispatcher.on('error', err => {
            console.log("Error playing into voice channel:");
            console.log(err);
            msg.reply("Sorry there was an error playing that command, please try again or try disconnecting me from the voice channel.");
        });
    }  
}

function purgeInactiveGuilds() {
    console.log("Checking inactive voice channels");

    // loop through voice channel objects in dict 
    for (var voiceChannel in voiceInactiveDict)
    {
        var lastCommandTime = voiceInactiveDict[voiceChannel];

        // check if current time - the time stored in dict is greater than 10 minutes
        var currentTime = new Date();
        var diff = Math.abs(currentTime - lastCommandTime) / 1000;
        console.log(diff);
        var minutesDiff = Math.floor(diff / 60) % 60;
        console.log(minutesDiff);
        if (minutesDiff > 1) // change this to 10m
        {
            console.log(voiceChannel);
            // if it is leave the voice channel for that guild 
            voiceChannel.leave();

            // delete it from dict 
            delete voiceInactiveDict[voiceChannel];
        }


        // else 
        // {
        //     setInterval(function() {
        //         isInactive(msg);
        //     }, 60 * 1000); // 60 * 1000 milsec
        // }
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
                if (msg.guild.voice.connection && msg.guild.voice.connection.dispatcher) {
                    msg.guild.voice.connection.dispatcher.destroy();
                    msg.guild.voice.connection.disconnect();
                }
            }
        }
        else if (command === 'help') {
            msg.channel.send(`
            Supported commands:
            **$help** - Displays the help menu
            **$manual** - Displays a TTS Manual Google Doc for using Brian. Made by gshredder
            **$stop** - Stops Brian while he is speaking
            **$tts <sentence to be read>** - Get Brian to read a sentence
            **$beatbox** - Sick beatz 
            `)
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

setInterval(function() {
    purgeInactiveGuilds();
}, 60 * 1000); // 60 * 1000 milsec

client.login(auth.token);


