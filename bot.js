// Start of the Awesome Discord Scheduling Bot

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const minimist = require('minimist');
const axios = require('axios');
const schedule = require('node-schedule');

let events = [];
let volunteers = [];
let timings = [];

client.login(auth.token);

client.on('ready', () => {
	console.log('Bot started successfully.');
});

client.on('message', msg => {

	let input = minimist(msg.content.split(/ (?=(?:(?:[^"]*"){2})*[^"]*$)/), {
		string: 'name',
		string: 'time',
		string: 'place',
		string: 'notes',
		string: 'ping',
		string: 'reminder',
		boolean: 'a',
		boolean: 'c',
		boolean: 'e'
	});

	if (input._[0] === '$meetup') {
		const command = input._[1];

		if (command === 'about') {
			msg.channel.send('Use MeetUp to schedule where, when, and how you and your friends will meet up. You can set up reminders, locations, and important information. Use "$meetup help" to see how to use the bot.');
		} else if (command === 'help') {

			if (!input.a && !input.c && !input.e) {
				msg.channel.send(help_general);
			} else {
				if (input.a) {
					msg.channel.send(help_arguments);
				}

				if (input.c) {
					msg.channel.send(help_commands);
				}

				if (input.e) {
					msg.channel.send(help_examples);
				}
			}

		} else if (command === 'enroll') {
			id = msg.author.id;
			if(!volunteers.includes(id)){
			volunteers.push(id);}
			console.log(volunteers);

		}
		
		else if (command === 'set') {

			if (input.hasOwnProperty('name') || !input.hasOwnProperty('name')) {

				vol_id =  msg.author.id;
				vol_name = msg.author.username;

				const event = undefined
				if (event == undefined) {
					if (!input.hasOwnProperty('time')) {
						msg.channel.send(err_missing_argument);
						return;
					}

					const d = new Date(input.time.replace(/"/g, '') + ' GMT-4:00');
					console.log(d);
					if (Object.prototype.toString.call(d) === "[object Date]") {
						// it is a date
						if (isNaN(d.getTime())) {  // d.valueOf() could also work
							msg.channel.send(err_bad_format);
							return;
						} else {
							// date is valid
						}
					} else {
						msg.channel.send(err_bad_format);
						return;
					}

					const newEvent = {
						// name: input.name.replace(/"/g, '') || null,
						name: null,
						time: input.time.replace(/"/g, ''),
						place: input.place || null,
						notes: input.notes || null,
						ping: input.ping || 'everyone',
						reminder: input.reminder || '2:00',
						job: null,
						username : msg.author
					}
					

					const dj = new Date(newEvent.time + ' GMT-04:00');
					const reminderMili = (newEvent.reminder.split(':')[0] * 60 * 60 + newEvent.reminder.split(':')[1] * 60) * 1000;

					if (new Date(dj.getTime() - reminderMili) < new Date()) {
						msg.channel.send("Oops! it looks like the reminder is being skipped!");
						return;
					} else {
						newEvent.job = schedule.scheduleJob(new Date(dj.getTime() - reminderMili), ping.bind(null, msg));
						events.push(newEvent);
						msg.channel.send('Event successfully added.');
						personal = msg.author;
						eventEmbed(personal, newEvent);
					}
				} else {
					const index = events.indexOf(event);

					events[index].place = input.place || events[index].place;
					events[index].notes = input.notes || events[index].notes;
					events[index].ping = input.ping || events[index].ping;
					events[index].reminder = input.reminder || events[index].reminder;

					if (input.time) {
						events[index].time = input.time.replace(/"/g, '');
						events[index].job.cancel();
						const dj = new Date(events[index].time + ' GMT-04:00');
						const reminderMili = (events[index].reminder.split(':')[0] * 60 * 60 + events[index].reminder.split(':')[1] * 60) * 1000;
						events[index].job = schedule.scheduleJob(new Date(dj.getTime() - reminderMili), ping.bind(null, msg));
					}
					msg.channel.send('Event successfully updated.');
					eventEmbed(msg.channel, events[index]);
				}
				events.sort((a, b) => {
					return new Date(a.time) - new Date(b.time)
				});
			} else {
				msg.channel.send(err_missing_argument);
				return;
			}

		} else if (command === 'ls' || command === 'list') {
			let str = "";
			if (events.length > 0) {
				for (const event of events) {
					str += (events.indexOf(event)+1) + ". " + event.time + "\n";
				}
				msg.channel.send(str);
			} else {
				msg.channel.send('There are no tracked events.');
			}

		} else if (command === 'get') {
			const event = events.find(event => event.name === input.name.replace(/"/g, ''));
			if (event) {
				eventEmbed(msg.channel, event);
			} else {
				msg.channel.send('An event with such name was not found.');
			}
			
		} else if (command === "setmeeting") {
			console.log(input._[2]);
			event_nummber = input._[2];

			if (event_nummber>0 && event_nummber<=events.length) {
				const index = event_nummber-1;
				const event = events[event_nummber-1];
				console.log(event.username)
				volunteerid = event.username;
				ping_meeting(volunteerid,event);
				event.job.cancel();
				events.splice(index, 1);
				msg.channel.send('Meeting successfully registered.');
				

			} else {
				msg.channel.send('An meeting with this number was not found.');
			}
		} else if (command === '1') {
			const event = events.find(event => event.name === input.name.replace(/"/g, ''));
			if (event) {
				const index = events.indexOf(event);
				event.job.cancel();
				events.splice(index, 1);
				msg.channel.send('Event successfully removed.');
			} else {
				msg.channel.send('An event with such name was not found.');
			}
		} 
		
		
		
		else {
			msg.channel.send(err_not_found);
		}
	}
});

function ping(msg) {
	let event = events[0];
	//const pingChannel = client.channels.cache.get('657394007093149697');
	const pingChannel = client.channels.cache.get('466890446199717888');
	let pingStr = "";
	if (event.ping.replace(/"/g, '') === 'everyone') {
		pingStr = '@everyone';
	} else if (event.ping.replace(/"/g, '') === 'no one') {
		pingStr = "Hey,";
	} else {
		let pings = event.ping.replace(/"/g, '').split(', ');
		for (let [key, value] of msg.guild.roles.cache) {
			for (const ping of pings) {
				if (value.name === ping) {
					pingStr += '<@&' + key + '>'
				}
			}
		}
	}

	pingChannel.send(pingStr + ' ' + event.reminder + ' left until ' + event.name);
	events.shift();
}

function maps(searchQuery) {
	return axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
		params: {
			key: auth.key,
			input: searchQuery,
			inputtype: 'textquery',
			fields: encodeURI(['formatted_address', 'photos'])
		}
	}).then(response => {
		return response.data;
	}).catch(err => {
		console.log(err);
	});
}


// Info Embeds:

const help_general = new Discord.MessageEmbed()
	.setTitle("Help: General")
	.setAuthor("MeetUp")
	.setColor('#007bff')
	.setDescription('This command should help you how to use the bot. Use one of the commands below to get additional details.')
	.addFields(
		{ name: 'Commands List', value: '$meetup help -c', inline: false },
		{ name: 'Arguments List', value: '$meetup help -a', inline: false },
		{ name: 'Examples', value: '$meetup help -e', inline: false }
	)
	.setFooter("MeetUp Bot")
	.setTimestamp();

const help_arguments = new Discord.MessageEmbed()
	.setTitle("Help: Arguments")
	.setAuthor("MeetUp")
	.setColor('#007bff')
	.setDescription('This is a list of arguments that could be used with each command. Arguments can come in any order.')
	.addFields(
		{ name: 'name', value: '[set][get][remove] (Required) The name of the event.', inline: false },
		{ name: 'time', value: '[set] (Required) The time when the event happens.', inline: false },
		{ name: 'place', value: '[set] (Optional) The location where the event happens.', inline: false },
		{ name: 'notes', value: '[set] (Optional) Additional notes for the event.', inline: false },
		{ name: 'ping', value: '[set] (Optional) Roles to ping for reminder. Default: everyone', inline: false },
		{ name: 'reminder', value: '[set] (Optional) Time before event to send reminder. Default: 2 hours', inline: false },
		{ name: 'a', value: '[help] Shows a list of arguments.', inline: false },
		{ name: 'c', value: '[help] Shows a list of commands.', inline: false },
		{ name: 'e', value: '[help] Shows a list of examples', inline: false }
	)
	.setFooter("MeetUp Bot")
	.setTimestamp();

const help_commands = new Discord.MessageEmbed()
	.setTitle("Help: Commands")
	.setAuthor("MeetUp")
	.setColor('#007bff')
	.setDescription('This is a list of commands that the bot supports. Only one command can be used at a time. To see a list of arguments for each command, please use "$meetup help -a".')
	.addFields(
		{ name: 'about', value: 'Get additional information on the bot.', inline: false },
		{ name: 'help', value: 'Used to get help on how to use the bot.', inline: false },
		{ name: 'set', value: 'Adds an event to the queue or edit if name already exists.', inline: false },
		{ name: 'get', value: 'Returns the event matching to the name given.', inline: false },
		{ name: 'remove', value: 'Removes the event matching to the name given.', inline: false },
		{ name: 'ls (or list)', value: 'Lists all the current events in the queue. ', inline: false },
	)
	.setFooter("MeetUp Bot")
	.setTimestamp();

const help_examples = new Discord.MessageEmbed()
	.setTitle("Help: Examples")
	.setAuthor("MeetUp")
	.setColor('#007bff')
	.setDescription('Below are several command examples. Note that you can type the arguments in any order as long as the required arguments are present.')
	.addFields(
		{ name: 'Add Event', value: '$meetup set --name "Fun Event" --time "September 3, 2020 18:30:00" --place "CN Tower"', inline: false },
		{ name: 'Edit Event', value: '$meetup set --name "Fun Event" --notes "Just a normal gathering near CN Tower"', inline: false },
		{ name: 'Get Event', value: '$meetup get --name "Fun Event"', inline: false }
	)
	.setFooter("MeetUp Bot")
	.setTimestamp();

// Event Embeds:

function eventEmbed(channel, event) {

	const embed = new Discord.MessageEmbed()
		.setColor('#00ff00')
		.setTitle('Timing Registered')
		.setAuthor(vol_name)
		.addField('When?', event.time, false)
		.setTimestamp()
		.setFooter('MeetUp Bot');

	if (event.notes) {
		embed.setDescription(event.notes.replace(/"/g, ''));
	}


		channel.send(embed);
	}


function ping_meeting(channel, event) {

	const embed = new Discord.MessageEmbed()
		.setColor('#FFFF00')
		.setTitle('Meeting set')
		.setAuthor(vol_name)
		.addField('When?', event.time, false)
		.setTimestamp()
		.setFooter('MeetUp Bot');

	if (event.notes) {
		embed.setDescription(event.notes.replace(/"/g, ''));
	}

	

		channel.send(embed);
	}

// Error Embeds:
function reminder(channel, event) {

	const embed = new Discord.MessageEmbed()
		.setColor('#FF0000')
		.setTitle('Reminder')
		.setAuthor(vol_name)
		.addField('When?', event.time, false)
		.setTimestamp()
		.setFooter('MeetUp Bot');

	if (event.notes) {
		embed.setDescription(event.notes.replace(/"/g, ''));
	}

	

		channel.send(embed);
	}



const err_not_found = new Discord.MessageEmbed()
	.setTitle("Error: Command Not Found")
	.setAuthor("MeetUp")
	.setColor('#ff0000')
	.setDescription('This command was not recognized. Please make sure you do not have a typo or use "$meetup help -c" to get a list of commands.')
	.setFooter("MeetUp Bot")
	.setTimestamp();

const err_missing_argument = new Discord.MessageEmbed()
	.setTitle("Error: Argument(s) Missing")
	.setAuthor("MeetUp")
	.setColor('#ff0000')
	.setDescription('One or more required arguments are missing. Please use "$meetup help -a" to get a full list of arguments.')
	.setFooter("MeetUp Bot")
	.setTimestamp();

const err_bad_format = new Discord.MessageEmbed()
	.setTitle("Error: Bad Format")
	.setAuthor("MeetUp")
	.setColor('#ff0000')
	.setDescription('Unable to parse one or more arguments. Please make sure you have used the correct format or use "$meetup help -e" to see a few examples.')
	.setFooter("MeetUp Bot")
	.setTimestamp();


// todo figure pings out
