var mtg = require('./mtgtop8');

// Get a list of events
var cards = {};
var requests = 0;
var curr_page = 1;
var curr_date = new Date();
// var target_date = new Date(2015,6,18,0,0,0,0)
var target_date = new Date(2017,6,18,0,0,0,0)
batch(curr_page)
function batch(start_page){
	for (page = start_page; page < start_page+10; page++){
		requests++;
		try{
			mtg.legacyEvents(page, function(err, events) {
				if (err) return console.error(err);
				for (var eve = 0; eve<events.length; eve++){
					requests++;
					try{
						mtg.event(events[eve].id, function(err, event) {
							if (err) return console.error(err);
							if(event.date < curr_date){
								curr_date = event.date;
							}
							for (var dind = 0; dind<event.decks.length; dind++){
								var decklist = deckMerge(event.decks[dind].cards.concat(event.decks[dind].sideboard))
								//console.log(decklist)
								if (decklist.find(d => d.name === 'Tundra') &&
										decklist.find(d => d.name === 'Force of Will') &&
										!decklist.find(d => d.name === 'Ancient Tomb') &&
										!decklist.find(d => d.name === 'Rishaden Port') &&
										!decklist.find(d => d.name === 'Cunning Wish') &&
										!decklist.find(d => d.name === 'Splinter Twin') &&
										!decklist.find(d => d.name === 'Cloudpost') &&
										!decklist.find(d => d.name === 'Tropical Island') &&
										!decklist.find(d => d.name === 'Underground Sea')){
									for(var cardind = 0; cardind < decklist.length; cardind++){
										cardname = decklist[cardind].name
										cardcount = decklist[cardind].count
										if (!(cardname in cards)){
											cards[cardname] = [0,0,0,0]
										}
										for(var i = 1; i<=cardcount;i++){
											cards[cardname][i-1]++
										}
									}

								}
							}
							requests--;
							if(requests <= 0){
								done()
							}
						});
					} catch (e) {
						console.log(e.name + ": " + e.message);
						requests--;
					}
				}
			requests--;
			if(requests <= 0){
				done()
			}
			});
		} catch (e) {
			console.log(e.name + ": " + e.message);
			requests--;
		}
	}
}

function done(){
	curr_page += 10	
	if (curr_date > target_date){
		console.log(curr_date,"out of",target_date)
		batch(curr_page)
	}
	else{
		for (var cardname in cards){
			var prim_count = 1;
			var sec_count = 0;
			var prim_occ = cards[cardname][0];
			var sec_occ = 0;
			for(var c = 1; c<4; c++){
				if(cards[cardname][c] >= prim_occ/2){
					prim_count++;
				}
				else if(cards[cardname][c] > 0){
					sec_count++;
					sec_occ+=cards[cardname][c];
				}
			}
			console.log(""+prim_count+","+cardname+","+prim_occ);
			if(sec_occ>0){
				console.log(""+sec_count+","+cardname+","+sec_occ);
			}
		}
	}
}

function deckMerge(decklist){
	var a = decklist.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].name === a[j].name){
				a[i].count += a[j].count
                a.splice(j--, 1);
			}
        }
    }
    return a;
}
