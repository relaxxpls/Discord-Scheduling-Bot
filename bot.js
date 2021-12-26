const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const minimist = require('minimist');
const axios = require('axios');
const schedule = require('node-schedule');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./schemas/Userschema.js');
const Slot = require('./schemas/slotsSchema.js');
require("dotenv").config();

// Mongoose_URI = auth.Mongoose_URI;
Mongoose_URI = auth.Mongoose_URI;
//     // "Microsoft_Azure" : "mongodb://test12:GoM0db3bRaskMd0lZvHTXEdEOFvuXpZs5DD1wjIx9Y8hLoNHLyF51nXVyA91BiRetrS0qpfUhAUWGe6UIwlN4Q==@test12.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@test12@",

mongoose
	.connect(auth.Mongoose_URI,{
	// auth: {
	// 	username: auth.COSMOSDB_USER,
	// 	password: auth.COSMOSDB_PASSWORD
	// 	},
	useNewUrlParser: true,
	useUnifiedTopology: true,
	// ssl: true

	// mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
	// 	auth: {
	// 	  user: process.env.COSMODDB_USER,
	// 	  password: process.env.COSMOSDB_PASSWORD
	// 	}
	//   })
	//   .then(() => console.log('Connection to CosmosDB successful'))
	//   .catch((err) => console.error(err));
	})
	.then((m)=>{
	console.log("Connected to the database");
	})
	.catch((err)=> console.log(err));

// mongoose.connect("mongodb://"+auth.COSMOSDB_HOST+":"+auth.COSMOSDB_PORT+"/"+auth.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
// 	auth: {
// 	  username: auth.COSMOSDB_USER,
// 	  password: auth.COSMOSDB_PASSWORD
// 	},
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   retryWrites: false
//   })
//   .then(() => console.log('Connection to CosmosDB successful'))
//   .catch((err) => console.error(err));

let events = [];
let volunteers = [];

client.login(auth.token);

client.on('ready', () => {
	console.log('Bot started successfully.');
});


	

client.on('message', async (msg) => {

	
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
		vol_id =  msg.author.id;
		vol_name = msg.author.username;


		if (command === 'about') {
			msg.channel.send('Use MeetUp to schedule Meetings. Use "$meetup help" to see how to use the bot.');
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

		} else if (command === 'register') {
			id = msg.author.id;
			if(!volunteers.includes(id)){
				volunteers.push(id);
			}
			console.log(volunteers);
			msg.channel.send("Volunteer successfully registered");
			const newuser =  User.create({
				username : msg.author.username,
				DiscordID : msg.author.id
			});
	
		}else if (command === 'delete') {

		setInterval(async() =>{
			// // var offTopic = client.channels.fetch("902296478742118400");
			// // console.log(offTopic);
			// fetched = await (await msg.channel).fetch({limit: 100});
			// msg.channel.bulkDelete(fetched);
			// }, 3000);

			async function clear() {
				// if(msg!=undefined) msg.delete();
				
				try{
					msg.delete();
					const fetched = await msg.channel.messages.fetch({limit: 99});
					try{
						await msg.channel.bulkDelete(fetched);
					}catch(err){
						console.log(err);
					}
				}catch(err){
					msg.channel.send("An error occured");
					console.log(err);
				}
				
				
			}
			clear();
		}, 3000);
	
		
		}else if (command === 'set') {

			
				// const event = undefined
				// if (event == undefined) {
					if (!input.hasOwnProperty('time') && !input.hasOwnProperty('_')) {
						msg.channel.send(err_missing_argument);
						return;
					}

					const d = new Date(input.time.replace(/"/g, '') + ' GMT-4:00');
					const d1 = new Date(input._[4].replace(/"/g, '') + ' GMT-4:00');

					if (Object.prototype.toString.call(d) === "[object Date]" && Object.prototype.toString.call(d1) === "[object Date]") {
						// it is a date
						if (isNaN(d.getTime() && isNaN(d1.getTime()))) {  // d.valueOf() could also work
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
						endtime: input._[4].replace(/"/g, ''),
						place: input.place || null,
						notes: input.notes || null,
						ping: input.ping || 'everyone',
						reminder: input.reminder || '2:00',
						job: null,
						username : msg.author
					}
					
					// const dj = new Date(newEvent.endtime + ' GMT-04:00');
					const dj1 = new Date(newEvent.time + ' GMT-00:00');
					const dj2 = new Date(newEvent.endtime + ' GMT-00:00');
					const reminderMili = (newEvent.reminder.split(':')[0] * 60 * 60 + newEvent.reminder.split(':')[1] * 60) * 1000;
					

					if (new Date(dj1.getTime() - 60000*11*30) < new Date() || new Date(dj2.getTime()) < new Date(dj1.getTime())) {
						msg.channel.send("Oops! Check the time format again");
						// console.log(dj.getTime() - reminderMili);
						// setTimeout(function(){console.log("Ready to create voice channnel")}, dj.getTime() - reminderMili);
						return;
					} else {
						newEvent.job = schedule.scheduleJob(new Date(dj1.getTime() - reminderMili), ping.bind(null, msg));
						events.push(newEvent);
						
						
						
						time_diff = parseInt(Math.abs((dj1-dj2)/(60*1000)));
						const half_hour_slots = time_diff/30;
						let a = new Date(dj1.setTime(dj1.getTime()));
						for (let i = 0; i < half_hour_slots; i++){
							const b = String(new Date(a - (5.5*60*60*1000)));
							
							Slot.find({ timing: b}, function (err, docs) {
								if (err){
									console.log(err);
								}else{
									if(docs[0]!=undefined){
										
										count = docs[0].frequency;
										
							
										
										Slot.findOneAndUpdate({timing: b}, {$set:{frequency: (count+1)}},{new: true},function(err, doc){
											if(err){
												console.log(err);
												msg.channel.send("An error occured");
											}
											if(i==half_hour_slots-1) msg.channel.send('Event successfully added.');
											});
								
								
									}else{	
										
										const newslot =  Slot.create({
											timing : b,
											DiscordID : msg.author.id,
											frequency: 1,
										})
										
										
										if(i==half_hour_slots-1) msg.channel.send('Event successfully added.');
										// var now = new Date();
										// var millisTill10 = new Date(b) - now;
										// console.log(a,now,millisTill10);

										// setTimeout(function(){
										// msg.guild.channels.create(`${msg.author.username} - ${b}`, {
										// 	type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
										//   permissionOverwrites: [
										// 							{
										// 							  id: msg.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
										// 								allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'], //Allow permissions
										// 								deny: [] //Deny permissions
										// 							}
										// 						   ],
										//    })
										//  .then((channel) => {
										// 	 const CategoryID = '913709879791857666';
										// 	 channel.setParent(CategoryID);
										// 	 channel.setUserLimit(2);
										//  }).catch(err =>{
										// 	 console.error(err);
										//  })}, millisTill10);
									};
								}
							});
							a = new Date(dj1.setTime(dj1.getTime() + (60*30*1000)));
						}
						// for(const tim in timings){
						// 	console.log(tim);
						// 	const newslot =  Slot.create({
						// 		timing : timings[tim][0],
						// 		DiscordID : timings[tim][1].username
						// 	});
						// }
						
						personal = msg.author;
						eventEmbed(personal, newEvent);
					}
				// } else {
				// 	const index = events.indexOf(event);

				// 	events[index].place = input.place || events[index].place;
				// 	events[index].notes = input.notes || events[index].notes;
				// 	events[index].ping = input.ping || events[index].ping;
				// 	events[index].reminder = input.reminder || events[index].reminder;

				// 	if (input.time) {
				// 		events[index].time = input.time.replace(/"/g, '');
				// 		events[index].job.cancel();
				// 		const dj1 = new Date(events[index].time + ' GMT-04:00');
				// 		const reminderMili = (events[index].reminder.split(':')[0] * 60 * 60 + events[index].reminder.split(':')[1] * 60) * 1000;
				// 		events[index].job = schedule.scheduleJob(new Date(dj1.getTime() - reminderMili), ping.bind(null, msg));
				// 	}
				// 	msg.channel.send('Event successfully updated.');
				// 	eventEmbed(msg.channel, events[index]);
				// }
				// events.sort((a, b) => {
				// 	return new Date(a.time) - new Date(b.time)
				// });
			

		} else if (command === 'ls' || command === 'list') {
			
			Slot.find({},function (err, docs) {
				if (err){
						console.log(err);
						msg.channel.send('An error occured');
				}else{
					let str = "";
					if (docs.length > 0) {
						for(let i=0;i<Math.min(docs.length, 10);i++){
							str += `${i+1}. ${docs[i].timing}\n`;	
						}
						msg.channel.send(str);
						// let args = ["a","b","c"];
						// let mainCatagory = '902122773281902604';
						// let channelName = args.slice(0).join(' '); //Arguments to set the channel name
						// msg.guild.channels.create(channelName, {
       					// type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
     					// permissionOverwrites: [
        				// 						   {
         				// 						    id: msg.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
           				// 							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'], //Allow permissions
           				// 							deny: [] //Deny permissions
		  				// 						 }
      					// 						],
      					// })
						// .then(temporary => {
						// 	temporary.setParent(mainCatagory)
						// }).catch(err =>{
						// 	console.error(err);
						// })
					}else {
						msg.channel.send('There are no tracked events.');
						console.log("BUSBAUBSS");
					}
				}
			});
			
		} else if (command === 'get') {
			const event = events.find(event => event.name === input.name.replace(/"/g, ''));
			if (event) {
				eventEmbed(msg.channel, event);
			} else {
				msg.channel.send('An event with such name was not found.');
			}
			
		} else if (command === "setmeeting") {
			event_number = parseInt(input._[2]);
			
			Slot.find({},function (err, docs) {
				if (err){
							console.log(err);
							msg.channel.send('An error occured');
				}else{
					let a =[];
					for(let i=0;i<docs.length;i++){
								a.push([docs[i].timing,docs[i].frequency]);	
						}
					if(event_number>0 && event_number<=a.length){
						ctrl = a.indexOf(a[event_number-1]);
						if(a[ctrl][1]==1){
							Slot.findOneAndDelete({timing: a[event_number-1]},function(err,event){
								if(err){
									console.log(err);
									msg.channel.send("An error occured");
								}
							msg.channel.send('Meeting successfully registered.');
							var now = new Date();
							var millisTill10 = new Date(event.timing) - now;
							setTimeout(function(){
								msg.guild.channels.create(`${msg.author.username} - ${event.timing}`, {
									type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
									// permissionOverwrites: [
									// 						{
									// 						  id: '841269212386295839', //To make it be seen by a certain role, user an ID instead
									// 						  deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
									// 						}
									// 					   ],
								   })
								 .then((channel) => {
									const CategoryID = '924619448164446258';
									channel.setParent(CategoryID);
									
									
									channel.overwritePermissions([
										{
										   id:  msg.author.id,
										   allow: ['VIEW_CHANNEL','CONNECT'],
										},
										{
											id:  msg.guild.roles.everyone.id,
											deny: ['VIEW_CHANNEL','CONNECT'],
										 },
										 {
											id:  event.DiscordID,
											allow: ['VIEW_CHANNEL','CONNECT'],
										 }
									]);
									
									try{channel.setUserLimit(2);
									}catch(err){console.log(err);}
									// channel.overwritePermissions([
									// 	{
									// 	   id:  msg.author.id,
									// 	   allow: ['VIEW_CHANNEL'],
									// 	}
									// ]);
									// channel.overwritePermissions([
									// 	{
									// 	   id: event.DiscordID,
									// 	   deny: ['SEND_MESSAGES', 'VIEW_CHANNEL','READ_MESSAGE_HISTORY'],
									// 	},
									// ]);
									// client.users.fetch(event.DiscordID, false).then((user) => {
									// 	console.log(user.username);
									//    });
									
									
									
        							// // channel.overwritePermissions(client.id, { VIEW_CHANNEL: true });
									// // channel.overwritePermissions(event.DiscordID, { VIEW_CHANNEL: true });
        							// // channel.overwritePermissions(msg.guild.roles.everyone.id, { VIEW_CHANNEL: false });
									 try{setTimeout(function(){channel.delete()}, 60000*40);
									}catch(err){
										console.log(err);
										msg.channel.send("An error occured");
									 }
									 
									 

								 }).catch(err =>{
									 console.error(err);
								 })}, Math.max(millisTill10, 0));
						
							client.users.fetch(event.DiscordID, false).then((user) => {
								ping_meeting(user,event.timing);
								setTimeout(function(){Reminder(user,event.timing)}, Math.max(millisTill10 - 60000*5));
								setTimeout(function(){Reminder(msg.author,event.timing)}, Math.max(millisTill10 - 60000*5));
							   });
							
							ping_meeting1(msg.channel,event.timing);
							Slot.find({},function (err, docs) {
								if (err){
										console.log(err);
										msg.channel.send('An error occured');
								}else{
									let str = "";
									if (docs.length > 0) {
										for(let i=0;i<Math.min(docs.length, 10);i++){
											str += `${i+1}. ${docs[i].timing}\n`;	
										}
										msg.channel.send(str);
									}else {
										msg.channel.send('There are no events left.');
									}
								}
							});
							});
						}else{
							Slot.findOneAndUpdate({timing: a[event_number-1][0]}, {$set:{frequency: (a[event_number-1][1]-1)}},{new: true},function(err, doc){
								if(err){
									console.log(err);
									msg.channel.send("An error occured");
							}
							msg.channel.send('Meeting successfully registered.');
							var now = new Date();
							var millisTill10 = new Date(doc.timing) - now;
							setTimeout(function(){
								msg.guild.channels.create(`${msg.author.username} - ${doc.timing}`, {
									type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
								  permissionOverwrites: [
															  {
																id: '841269212386295839', //To make it be seen by a certain role, user an ID instead
																	deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
															}
														   ],
								   })
								 .then((channel) => {
									 const CategoryID = '924619448164446258';
									 channel.setParent(CategoryID);
									 channel.setUserLimit(2);
									channel.overwritePermissions([
										{
										   id:  msg.author.id,
										   allow: ['VIEW_CHANNEL','CONNECT'],
										},
										{
											id:  msg.guild.roles.everyone.id,
											deny: ['VIEW_CHANNEL','CONNECT'],
										 },
										 {
											id:  doc.DiscordID,
											allow: ['VIEW_CHANNEL','CONNECT'],
										 }
									]);
									 try{setTimeout(function(){channel.delete()}, 60000*40);
									}catch(err){
										console.log(err);
										msg.channel.send("An error occured");
									 }
								 }).catch(err =>{
									 console.error(err);
								 })}, Math.max(millisTill10));
							
							console.log(doc.DiscordID,"aaaaaa",typeof doc.DiscordID);
							client.users.fetch(doc.DiscordID, false).then((user) => {
								ping_meeting(user,doc.timing);
								setTimeout(function(){Reminder(user,doc.timing)}, Math.max(millisTill10 - 60000*5));
								setTimeout(function(){Reminder(msg.author,doc.timing)}, Math.max(millisTill10 - 60000*5));
							   });
							ping_meeting1(msg.channel,doc.timing);
							
							Slot.find({},function (err, docs) {
								if (err){
										console.log(err);
										msg.channel.send('An error occured');
								}else{
									let str = "";
									if (docs.length > 0) {
										for(let i=0;i<Math.min(docs.length, 10);i++){
											str += `${i+1}. ${docs[i].timing}\n`;	
										}
										msg.channel.send(str);
									}else {
										msg.channel.send('There are no events left.');
									}
								}
							});
							});
						}
						
						
				
					}else{
						msg.channel.send('A meeting with this serial number was not found.');	
					}
				}
			});
				// let timing = timings[event_number-1];
				// timings.splice(event_number-1, 1);
				// msg.channel.send('Meeting successfully registered.');
				// ping_meeting(timing[1],timing);
				// ping_meeting1(msg.channel,timing[0]);


				// const index = event_nummber-1;
				// const event = events[event_nummber-1];
				// console.log(event.username)
				// volunteerid = event.username;
				// ping_meeting(msg.author,event);
				// // event.job.cancel();
				// events.splice(index, 1);
				// msg.channel.send('Meeting successfully registered.');
				

			
				
			
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
		// .setAuthor(vol_name)
		.addField('When?', event.time + " - " + event.endtime, false)
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
		// .setAuthor(channel.username)
		.addField('When?', event, false)
		.setTimestamp()
		.setFooter('MeetUp Bot');

	// if (event.notes) {
	// 	embed.setDescription(event.notes.replace(/"/g, ''));
	// }

	

		channel.send(embed);
	}

function ping_meeting1(channel, event) {

	const embed = new Discord.MessageEmbed()
			.setColor('#FFFF00')
			.setTitle('Meeting set')
			// .setAuthor(channel.username)
			.addField('When?', event, false)
			.setTimestamp()
			.setFooter('MeetUp Bot');
	
		// if (event.notes) {
		// 	embed.setDescription(event.notes.replace(/"/g, ''));
		// }
	
		
	
		channel.send(embed);
	}

function Reminder(channel, event) {

	const embed = new Discord.MessageEmbed()
			.setColor('#FF0000')
			.setTitle('REMINDER')
			// .setAuthor(channel.username)
			.addField('When?', event, false)
			.setTimestamp()
			.setFooter('MeetUp Bot');
	
		// if (event.notes) {
		// 	embed.setDescription(event.notes.replace(/"/g, ''));
		// }
	
		
		channel.send(embed);
	}
// Error Embeds:

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