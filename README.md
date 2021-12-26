`$meetup register`
 enroll a volunteer
 Currently its just add the ID of the volunteer to the data, no features as such are used.
 NNeed to add some feature so that clients cannot register themselves as volunteer - maybe seperatley dm the bot and use this command but it doesn't solves the problem completely as clients can also enroll themselves if they got to know about this. 
 

`$meetup ls`
 Displays a list of timings by serial number with date.
 meeting setupmeeting 1 - timing details + meetup ls
 

 ls countter variable ofr multiple entries a + username side mai

 meetup update

 meetup delete  


`$Meetup set --time "Month date ,year time`
For eg :- $meetup set  --time "November 10, 2021 17:36:00"

This command will be used by Volunteer, I was planning to put a restriction for users to not use this command. Currently it uses only one format(shown in example) for adding time, we can implement more features in set timings as we see fit as we move along.

After the timing is registered it simultaneously adds it into the list of slots. We can see the added timing immideately by using "$meetup ls" 

It also simultaneously sends a personal message by Bot confirming the timing registered to the volunteer.


`$meetup setmeeting (meeting number according to the ls command) `
For eg :- $meetup setmeeting 1

This command will be used by users. The users can see the list of timings using $meetup ls command and by seeing the serial number, they can register the slot for them.

As soon as the slot is registered, the list of slots is updated and a personal message is also sent by the Bot to the volunteer who had set the timing. 

`Sort timings issue` 
We will add end limit for timings slot - done
We will also change the timings format - (learn regex)
Divide timings into half-hour slots and user can get to choose from the half hour slots - done
Consider for not a half-hour slot too later on

`Add timings and volunteer info in database`

`Add env and remove auth.json`

`Let specific commands handle by specific roles` 
for eg: set time only handle by volunteers

`bugs`
check for timings if it adds even though it is before the current time
Discord can't send longer messages (approx 30 timeslots in ls command) - ?number of timings to show in meetup ls if it exceedes the limit - sorting the timings and show the first 10-15
interchange the timings - start and end timings
doesn't work with nodemon - it restarts repeatedly ://
Sorting the timing according to the time it added
Delete the meeting from the database when the time is over 
check what is endtiming in event, do we use it?
Time limit for set timeout function - approx 24 days
Code reusability
Give reminder to client as well






