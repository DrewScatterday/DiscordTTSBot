var AWS = require('aws-sdk');
const Discord = require('discord.js'); 
const fs = require('fs');
var auth = require('./auth.json');

var m_currentPlaying = "";
const client = new Discord.Client();
const prefix = '$'; 
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

    var fileName = 'sounds/' + msg.id + '.mp3';
    Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.log("Error getting from polly");
            return err;
        }
        if (data.AudioStream instanceof Buffer) {
            fs.writeFile(fileName, data.AudioStream, function (fsErr) {
                if (fsErr) {
                    console.log("Error writing " + fileName);
                    return fsErr;
                } else {
                    console.log(fileName + ' written sucessfully');
                }
            })
        }
    });

    return fileName;
}

function deleteFile(fileName) {
    fs.unlinkSync("./" + fileName, function(err){
        if (err) {
            console.log("failed to delete " + fileName);
            console.log(err);
            return;
        } 
        console.log(fileName + ' successfully deleted');                                     
    });
}

function playSound(msg, fileName) {
    var voiceChannel = msg.member.voice.channel;
    
    voiceChannel.join()
    .then(connection => {
        m_currentPlaying = fileName; 
        const dispatcher = connection.play(fileName);
        dispatcher.on("finish", end => {
            voiceChannel.leave();
            deleteFile(fileName);
            m_currentPlaying = "";
        });
    })
    
    // TO DO: Change this to let the bot stay in the voice channel and listen for commands: 
    
    //if (!msg.guild.me.voice.channel) {
    // else { // else already in a voice chat 
    //     m_currentPlaying = fileName;
    //     const dispatcher = msg.guild.voice.connection.play(fileName);
    //     dispatcher.on("finish", end => {
    //         //voiceChannel.leave();
    //         deleteFile(fileName);
    //         m_currentPlaying = "";
    //     });
    // }
   
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
  
client.on('message', async msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return; 
 
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'tts') {
        if (msg.member.voice.channel) {
            var sentence = args.join(" ");
            try {
                var file = getTTS(msg, sentence);
                console.log(file);
                playSound(msg, file);
            }
            catch(err) {
                msg.reply("There was an error with that command, I'm sorry");
                console.log(err);
                return; 
            }
        }
    }
    else if (command === 'manual') {
        msg.reply("https://docs.google.com/document/d/1qLKdc3QArtn6PVuGf42EfoMuzvLE_ykWwU1RViEcrbU/edit");
    }
    else if (command === 'stop') {
        if (msg.member.voice.channel) 
        {
            console.log(m_currentPlaying);
            msg.guild.voice.connection.dispatcher.destroy();
            msg.guild.voice.connection.disconnect();
            deleteFile(m_currentPlaying);
            m_currentPlaying = "";
        }
    }
});

client.login(auth.token);


