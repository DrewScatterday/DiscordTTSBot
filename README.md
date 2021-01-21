# Discord Text To Speech Bot: 
## Purpose:
I wrote this Discord bot so my friends and I could mess around with the text to speech voice character named Brian in Discord. Using odd symbols and words you can make Brian say goofy things like make him beatbox or say things extremely fast. In this project I wanted to get experience using JavaScript and also using Discord.js 

## Supported commands:

* **$help** - Displays the help menu
* **$manual** - Displays a TTS Manual Google Doc for using Brian. Made by gshredder
* **$stop** - Stops Brian while he is speaking
* **$tts [sentence to be read]** - Get Brian to read a sentence
* **$beatbox** - Sick beatz 


## Built with:
* Node.js=14.15.3
* Discord.js=12.5.1
* @discord.js/opus=0.3.3
* aws-sdk=2.819.0
* ffmpeg-static=4.2.7

## Files: 
* main.js - The main source code file that processes all of the commands
* package.json / package-lock.json - Json files that describe the Node.js package dependencies

## Usage 
To invite the bot to your discord server:
* Use this discord bot invite [link](https://discord.com/oauth2/authorize?client_id=793354487699865611&scope=bot&permissions=37030976)  
* Here is the discord.bots.gg [page](https://discord.bots.gg/bots/793354487699865611)
* Here is the top.gg discord bot [page](https://top.gg/bot/793354487699865611)

To run the source code on your machine:
* First [download](https://nodejs.org/en/download/) Node.js 
* Then change to the directory where this project is installed and type `npm install` 
* Follow this [tutorial](https://www.sitepoint.com/discord-bot-node-js/) to setup a bot in the Discord development application portal
* Create an AWS account and follow this [tutorial](https://www.youtube.com/watch?v=Vkp_Di2qbsc) to create an AWS polly security key 
* After creating a token for the bot in the Discord dev portal and after setuping your AWS account, create an auth.json file in the project directory that looks like this:

`{"token" : "discord-bot-token-goes-here", "accessKey" : "aws-accesskey-goes-here", "secret" : "secret-access-key-goes-here"}`

* Lastly, type `node main.js` in command line to run the code and your bot should appear online in your discord server 
