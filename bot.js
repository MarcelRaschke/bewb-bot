var request = require('request');
var cheerio = require('cheerio');
const Discord = require('discord.js');
const bot = new Discord.Client();
var users = require('./users.json');
const TOKEN = require('../token.json').token;

var Users = new Map();

function init() {
	bot.on("ready", () => {
		console.log('connected');
		for (let i=0; i < users.length; i++)
		{
			let user = users[i];
			setInterval(function() {
				request({
					uri: 'https://api.picarto.tv/v1/channel/name/' + user.username
				}, function(error, responce, body) {
					try {
					let online = JSON.parse(body).online;
					let privat = JSON.parse(body).private;
					if (user.online == false && online == true && privat == false) {
						user.online = true;
						for (let i=0; i < user.server.length; i++) {
							let sp = user.server[i].split(":");
							let guild = sp[0];
							let channel = sp[1];
						bot
							.guilds.find('name', guild)
							.channels.find('name', channel)
							.send(user.notification);
						}
					}

					if (user.online == true && online == false) {
						user.online = false;
					} 
					}
					catch(err) {
						console.log("SHIT HAPPENS!!:  " + err)
					}
				});
			}
				,30*1000
			);
		}

	});

	bot.on("reconnecting", () => { process.exit(1) });

	bot.setTimeout(function() {
		if (isNaN(bot.ping)) process.exit(1);
	},10 * 1000);

	bot.on("message", message => {
		for (let i=0; i < users.length; i++)
		{
			let user = users[i];

			if (message.content.toLowerCase().search(user.command) >= 0 && message.author != bot.user ) {

				const { exec } = require('child_process');
				exec('ffmpeg -y -timeout 1500000 -i https://1-edge5-us-east.picarto.tv/mp4/'+ user.username +'.mp4 -vframes 1 '+ user.username +'.png', (err, stdout, stderr) => {
					if (err) {
						message.channel.send(user.failMessage);
						console.log(err);
						return;
					}
					var image = new Discord.Attachment(user.username + '.png', 'sceenshot.png');
					message.channel.send(user.okMessage, image);
				});

			}
		}
	});

	bot.on("message", message => {
		if (message.content.toLowerCase().search("!bewblist") >= 0 && message.author != bot.user) {
			answer = "List of users: \n";
			for (let i=0; i < users.length; i++) {
				let user = users[i];
				answer += user.username + ' -> `' + user.command + '` \n';
			}
			message.channel.send(answer);
		}
	});



	bot.on("message", message => {
		if (message.content.toLowerCase().search("bewbot")>=0 && message.content.toLowerCase().search("are you") >= 0)
		{
			if (getRandomInt(0,2)) {
				let image = new Discord.Attachment('pictures/yes.png', 'tooru.png');
				message.channel.send('Yes, ' + message.author.username, image);
			} else {
				let image = new Discord.Attachment('pictures/no.png', 'tooru.png');
				message.channel.send('No, ' + message.author.username + ', you baka!', image);
			}
		}
	});

	bot.on("message", message => {
		if (message.content.toLowerCase().search("!bewbinfo")>=0)
		{
			let image = new Discord.Attachment('pictures/logo.png', 'tooru.png');
			message.channel.send('I am BewbBot created by **`Animalex`** \nMy mission is to notify you about streams and post screenshots! \nYou can see all users and commands by typing `!bewblist` ', image);
		}
	});






	bot.on("message", message => {
		if (message.content.toLowerCase().search("!avatar")>=0 && message.author != bot.user)
		{
			var usr;
			let m = message.content.split(" ");
			try{
				m.find(function(e,i,a){
					if (e == "!avatar") usr=message.guild.members.find(val => val.user.username.search(m[i+1]) >= 0).user;
				})
				message.channel.send(WebImage(usr.avatarURL));
			} catch (err) {
				console.log(err)
				message.channel.send("I didn't found the user T__T");
			}
		}
	});
	bot.login(TOKEN);
}

init();

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '0x';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return parseInt(color);
}

function WebImage(url) {
	return {
		"embed": {
			"color": getRandomColor(),
			"image": {
				"url": url
			}
		}
	};
}
