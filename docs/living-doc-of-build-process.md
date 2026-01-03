okay so the project started as a solution to one of freecodecamp's certifications, the data visualization one. 

i designed an initial UI and that was fine. 

but my first real hurdle was that i didnt have any data.

i knew i could use an API but i didnt have any that stood out to me AND had the numbers i needed. i eventually settled on something as a back up, i think the pokemon one. i wouldve stopped there had freecodecamp not already had you make a pokedex using that API. i figured it would be lazy to use the same one again, and i was curious what else was out there, i love exploring, so why not?

well i must have searched 100+ APIs, looking through docs, windows '98 style sites and a TON of lists on github about the best APIs, the most useful APIs, the silliest APIs (they have a bunch of lists lol), but again, i couldnt find one that was more appealing than my default.

it was then that i thought about combining APIs, and i was watching some of the freecodecamp alumni videos on youtube with their solutions for their certs and idr if it was part of the cert or if he did it as an extra for fun but he basically had a map of the world drawn out with javascript by pulling a pair of free files (the topoJSON, which has JSON directions for drawing the borders of each country in a SVG format, and another JSON to link country codes to the drawn objects).

after that i was convicted on combining that with the freecodecamp cert and having you click the country and pull up the chart, cool right??!

well i still had no data lolol but now im sold on the idea, so i do a bit of digging on country APIs, i used to be heavy into finance and global news and i knew there were free APIs to find international financial info, so i figured there had to be one for population and whatnot. 

and once i set that intention, guess what i found next?

one of the coolest (not) APIs ive ever seen, complete with all the jank that comes with them but minus the rate limits: 

The CIA World Factbook!

yes, THAT CIA, LOL! they have a whole website where you can search but the interactive features were lacking when i first found it. 

but thats not the cool part. the cool part is that some random human (i love you, whoever you are), decided to make a github that auto-pulls the info from the website into JSON files BY COUNTRY CODE!! 

so everything was ready, i had the file to draw the map, the corresponding file to link country codes to it and a whole, rate-limit free github based API to link the data directly to the country codes and thus, the drawn objects.

it was all coming together so swimmingly (pardon my finesse), and i couldnt help but be incredibly pleased with myself. for a bit of context, for every tutorial, i watched it maybe 3 times back to back and then maybe 4 more times as i followed along in the ensueing days. so by the time i found the factbook, i already had a working map prototype, an initial UI, a documented outline and was noodling on a 3D version of the map/globe using three.js (overlaying the SVG over the 3D globe turned out to be way harder than i thought and required a bit more troubleshooting than i felt was necessary at that stage, albeit after a week or two of failed attempts).

so when i coded everything up, connected the APIs, and clicked on that first country, i was absolutely eccstatic when i saw data...

> "What the heck, I clicked on Canada, not Croatia..."

for whatever reason, the dang country codes were out of alignment!!

the JSON file pair i used had different codes from the world factbook JSON (go figures, the standardizing machine mustve been broken 🙄).

at this point i felt like all hope was lost...for like half a second lol.

> "These are just JSON files...what's stopping me from creating my own github repo with the correct country codes?"

and once again, github was to the rescue (love them so much, fr fr).

so after a bit of trial and error, some troubleshooting, many times i used the click-and-read-console technique, and to much success! and then i ran into my next hurdle...

so there used to be a issue, its hard to even remember what it truly affected, the whole thing was a blur (i was so annoyed lololol). but there were countries that were in the wrong place, like they had switched with another country or had duplicates, those ended up being a country code issue (those lovely conflicts i talked about earlier 🙃) but then there were a ton of countries and objects that didnt have any data but were drawn on (also a country code issue but the JSON pair just marked them as XX or AA or something, whereas the factbook had the actual codes). again, github to the rescue, i was able to cross-reference and update the JSON files so that everything was in its right place.

then came a lesser hurdle but it was still there, how do i show the data (at this point there was a TON of data points, multiplied by 240~ countries/territories) and how do i set up the charts so that the user doesnt have to click every country for it to work properly.

the first part of that was just UI/UX work and seeing as im a user, it was fairly easy, after a few hours in front of the whiteboard and exploring some ideas with v0, i ended with the current design.

the second part im actually still working on as i type this up, but ill tell you the next thing im trying after this. 

theres specified groups across the globe, G20, NATO, 5 Eyes, etc., and i thought it might be easy to save like 10-20 points from maybe 20-40 countries and have them cached, that way theres atleast 20 different points of data on each chart but also it allows a rankings system and leaderboard to be an interesting addition.

im literally trying this now and we'll see how effective it is.