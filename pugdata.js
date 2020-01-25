var state = {}; 

document.addEventListener('DOMContentLoaded', (event) => {
var url_string = window.location.href
var url = new URL(url_string);
state.id1 = url.searchParams.get("id1");
state.id2 = url.searchParams.get("id2");
var compareTwo = state.id1 ? state.id2 ? true : false : false;

init(state);//big TODO: make all functions return state, never touch global state

//TODO: generalize use this


// addDateOnChangeListener("datemin1");
// addDateOnChangeListener("datemax1");

function addDateOnChangeListener(htmlId) {
	document.getElementById(htmlId).addEventListener("change", function(e){
		state[htmlId] = new Date(e.target.value).getTime();
	})
	// console.log(state[htmlId]);
}



document.getElementById('datemin1').addEventListener("change", function(e){
	state['datemin1'] = new Date(e.target.value).getTime();
	var playerData = getPlayerData(data, state.id1, state.datemin1, state.datemax1)
	var chartData = matchesToTimelineData(playerData.matches, state.id1);
	pickOrderTable(playerData.picks);
	addData(state.chart1, chartData);
})

document.getElementById("datemax1").addEventListener("change", function(e){
	state.datemax1 = new Date(e.target.value).getTime();
	var playerData = getPlayerData(data, state.id1, state.datemin1, state.datemax1)
	var chartData = matchesToTimelineData( playerData.matches, state.id1);
	pickOrderTable(playerData.picks);
	addData(state.chart1, chartData);
})
function ifnotthenmake() {

}

function getPlayerData(data,playerid,mintime,maxtime) {
	var picks = [];
	for(i=1;i<=12;i++){
		picks.push({win: 0, loss: 0, tie: 0});
	}
	const res = data.filter(function(match) {
		if (match.queue.id != 1548704432021)
		{ return false;}
		if (match.timestamp < mintime || match.timestamp > maxtime) {
			return;
		}
		const found = match.players.find(function(player){
			if(player.user.id === parseInt(playerid)) {
				if(player.captain != 1) {
					if(player.pickOrder == null) {
						//player was subbed out - do nothing
					}
					else if (match.winningTeam == player.team) {
						picks[player.pickOrder-1].win++;
					} else if (match.winningTeam != 0) {
						picks[player.pickOrder-1].loss++;
					} else if (match.winningTeam == 0) {
						picks[player.pickOrder-1].tie++;
					}	
				}
				return true;
			}
			// return (player.user.id === parseInt(playerid));
		})
		return found;
	})
	return {matches: res,
					picks:   picks};
}

function matchesToTimelineData(matches, userid) {
	var data = {	labels: [],
								datasets: []
							}

	var dataset = { label: "win/loss",
								  data: [],
									backgroundColor: "#A569BD"};
	var win = 0;
	var loss = 0;
	var pickOrder = [];
	var pickCount = 0;
	var pickData = [];
	matches.forEach(function (match) {
		var player = match.players.find(function(player){
			return player.user.id == userid;
		});
		//only collect pickorder when not captain
		if (player.captain == 0) {
			pickCount++;
			pickOrder.push(player.pickOrder);
			pickData.push({t: match.timestamp, y: pickOrder.reduce((a, b) => a + b, pickOrder[0]) / pickCount});
		}
		if (match.winningTeam == 0) {
			return;
		}
		if (player.team == match.winningTeam) {
			win++;
		} else {
			loss++;
		}
		if(loss == 0) {
			dataset.data.push( { t: match.timestamp, y: win });
		} else {
			dataset.data.push({t: match.timestamp, y: win/loss}); 
		}
		// data.labels.push(new Date( match.timestamp));
	})

	var pods = { label: "avg pickorder",
							 data: pickData,
							 backgroundColor: "#D7DBDD"
						 };

	

	data.datasets.push(dataset);
	data.datasets.push(pods);
	// console.log(pods);
	return data;
}

function init(state) {
	state.playerArr = [];
	state.players = {};

	data.forEach(function(match){
		match.players.forEach(function(player){
			state.players[player.user.id] = player.user.name;
		})
	})

	Object.keys(state.players).forEach(function(key) {
		state.playerArr.push({ id: key, 
													 name: state.players[key], 
													 matches: 0, 
													 captained: 0,
													 win: 0,
									 				 loss: 0,
									 				 cwin: 0,
									 				 closs: 0,
									});
	
	});

	// init player objects for comparison (only used if id1 and id2 is set)
	state.player1 = {	//cWins:  0,
										// wins:   0,
										// losses: 0,
										htmlId: "p1",
									};
	state.player2 = {	//cWins: 	0,
										// wins: 	0,
										// losses: 0,
										htmlId: "p2",
									};

  // init player names
	state.playerArr.find((stored,i) => {
		if(stored.id == state.id1) {
			state.player1.name = stored.name;
		}
		if(stored.id == state.id2) {
			state.player2.name = stored.name;
		}
	});
	
	// combined data for both compared players
	state.cData = {	matches: 				0,
									bothWin: 				0,
									bothLose: 			0,
									bothCaptain: 		0,
									ties: 					0,
									p1win: 0, p2win: 0,
									p1cwin: 0, p2cwin: 0,
								};

}

// todo: remove all params
getCompareStats(state);
console.log(state);
getCpm();
getCWR();

function getCpm() 
{	state.playerArr.forEach( function(player){
		var cpm = (player.captained / player.matches) * 100;
		cpm = cpm.toString().substring(0,4);
		player.cpm = cpm + "%";
	})
}

function getCWR() {
	state.playerArr.forEach( function(player){
		var cwr = (player.cwin / player.closs) /// 2 * 100;
		cwr = cwr.toString().substring(0,4);
		player.cwr = cwr //+ "%";
	})
}



if (state.id1 && state.id2) {	
	// document.getElementById("noCompareDiv").style.display = "none";
	// document.getElementById("compareDiv").style.display = "block";
	displayComparison(state.cData);
}

function getCompareStats(state) {
	// cData = {	matches: 				0,
	// 					bothWin: 				0,
	// 					bothLose: 			0,
	// 					bothCaptain: 		0,
	// 					ties: 					0,
	// 					p1win: 0, p2win: 0,
	// 					p1cwin: 0, p2cwin: 0
	// 				};
	// Loop through every match/player and gather data
	data.forEach(function(match){
		// Only looking at stats for PUG queue
	 	if (match.queue.id != 1548704432021) {
	 		return;
	 	}
		var matchPlayerArr = [];

		match.players.forEach(function(player){
			
			if(state.id1 && state.id2) { // if we are comparing two players
				matchPlayerArr.push({	id: player.user.id,
														 	name: player.user.name,
														 	team: player.team,
														 	captain: player.captain,
														 });
			}
			

			state.playerArr.find((stored,i) => {
				if(stored.id == player.user.id) {
						

						state.playerArr[i] = {  id: 				stored.id, 
																		name: 			stored.name, 
																		matches: 		stored.matches + 1, 
																		captained:  (player.captain == 1) ? stored.captained + 1 : stored.captained,
																		win: (match.winningTeam == player.team) ? stored.win + 1 : stored.win,
																		loss: (match.winningTeam == player.team || match.winningTeam == 0) ? stored.loss : stored.loss + 1,
																		cwin: (player.captain && match.winningTeam==player.team) ? stored.cwin + 1 : stored.cwin,
																		closs: (match.winningTeam != 0 && player.captain &&  match.winningTeam != player.team) ? stored.closs + 1 : stored.closs
														}
				return true; // return true == .find() is done			
				}
			})
		});
		
		if(state.id1 && state.id2) {
			var found1 = false, found2 = false;
			matchPlayerArr.forEach((player) => {
				if (parseInt(player.id) === parseInt(state.id1)) {
					found1 = true;
					fp1 = player;
				}
				if (parseInt(player.id) === parseInt(state.id2)) {
					found2 = true;
					fp2 = player;
				}
			});
			if(found1 && found2) {
				state.cData.matches = state.cData.matches + 1;
				//both captained
				if(fp1.captain && fp2.captain) {
					state.cData.bothCaptain = state.cData.bothCaptain + 1;
					if (fp1.team == match.winningTeam) {
						state.cData.p1cwin++;
					}
					if (fp2.team == match.winningTeam) {
						state.cData.p2cwin++;
					}
				}
				//both win together
				if(match.winningTeam == fp1.team && match.winningTeam == fp2.team) {
					state.cData.bothWin++;
				}
				//both lose
				if(match.winningTeam != fp1.team && match.winningTeam != fp2.team && match.winningTeam != 0) {
					state.cData.bothLose++;
				}
				//wins
				if(fp1.team != fp2.team && match.winningTeam == fp1.team) {
					state.cData.p1win++;
				}
				if(fp1.team != fp2.team && match.winningTeam == fp2.team) {
					state.cData.p2win++;
				}
				//ties
				if(match.winningTeam == 0) {
					state.cData.ties = state.cData.ties +1;
				}
			}
		}
	})
}

if(state.id1) {
	displayPlayer(state.player1.name, state.cData.p1cwin, state.cData.p1win, state.cData.p2win, state.player1.htmlId);
}
if(state.id2) {
	displayPlayer(state.player2.name, state.cData.p2cwin, state.cData.p2win, state.cData.p1win, state.player2.htmlId);
}

function onPlayerClick(id){
	if (state.id1 == null){
		if(state.id2 == id){
			state.id1=null;
			state.id2=null;
		} else {
			state.id1=id;
		}
	}	else if (state.id1 == id){
		state.id1 = null;
		// state.id2 = null;
	} else if (state.id2 == id){
		state.id2 = null;
	} else if (state.id1 && ! state.id2){
		state.id2 = id;
	} else if (state.id1 && state.id2){
		state.id2 = id;}
	init(state) // TODO: remove this
	getCompareStats(state);
	getCpm(); //TODO this shouldnt be needed
	getCWR();
	displayPlayer(state.player2.name, state.cData.p2cwin, state.cData.p2win, state.cData.p1win, state.player2.htmlId);
	displayPlayer(state.player1.name, state.cData.p1cwin, state.cData.p1win, state.cData.p2win, state.player1.htmlId);
	displayIndexTable();
	if(state.id1){
		removeData(state.chart1)
		// winLossChart( matchesToTimelineData( getPlayerData(data, state.id1),state.id1 ), "chart1");
		var playerData = getPlayerData(data, state.id1, state.datemin1, state.datemax1)
		pickOrderTable(playerData.picks);
		var chartData = matchesToTimelineData(playerData.matches, state.id1);
		addData(state.chart1, chartData);
	}
	if(state.id2){
		removeData(state.chart1)
		var playerData = getPlayerData(data, state.id2);
		var chartData = matchesToTimelineData( playerData.matches,state.id2);
		addData(state.chart2, chartData);
		// console.log(state.chart2);
	}
	if (state.id1 && state.id2) {	
		// document.getElementById("noCompareDiv").style.display = "none";
		// document.getElementById("compareDiv").style.display = "block";
		displayComparison(state.cData)
	} else {
		// document.getElementById("noCompareDiv").style.display = "block";
		// document.getElementById("compareDiv").style.display = "none"; 
	}

}

function onTheadClick(key) {
	switch(key) {
  case "name":
  	state.compFn = compName;
    displayIndexTable();
    break;
  case "matches":
  	state.compFn = compMatches;
    displayIndexTable();
    break;
  case "captained":
  	state.compFn = compCaptained;
    displayIndexTable();
    break;
  case "win":
 		state.compFn = compWin;
    displayIndexTable();
    break;
  case "loss":
 		state.compFn = compLoss;
    displayIndexTable();
    break;
  case "cpm":
  	state.compFn = compCPM;
    displayIndexTable();
    break;
  case "cwr":
  	state.compFn = compCWR;
    displayIndexTable();
    break;
  case "cwin":
  	state.compFn = compcwin;
    displayIndexTable();
    break;
  case "closs":
		state.compFn = compcloss;
  	displayIndexTable();
  	break;

  default:
	}
}

state.compFn = compMatches;
displayIndexTable();

function pickOrderTable(pickOrder) {
	console.log(pickOrder);
	var table = document.getElementById("pickOrderTable").getElementsByTagName('tbody')[0];
	table.innerHTML = "";
	pickOrder.forEach(function(po,i){
		var tr = table.insertRow();
		tr.insertCell().appendChild(document.createTextNode('#' + (i+1)  ));
		tr.insertCell().appendChild(document.createTextNode(po.win));
		tr.insertCell().appendChild(document.createTextNode(po.loss));
		tr.insertCell().appendChild(document.createTextNode(po.tie));
		tr.insertCell().appendChild(document.createTextNode(
			(po.loss == 0) ? po.win.toString().substring(0,4) :
			(po.win / po.loss ).toString().substring(0,4))
		);	
	})
}

function displayIndexTable() {
	state.playerArr.sort(state.compFn);
	playersTable = document.getElementById("playersTable");
	playersTable.innerHTML = "";
	// Table head
	var thead = document.createElement('thead'); //(playersTable.getElementsByTagName('thead')[0];
	var tr = document.createElement('tr');
	Object.keys(state.playerArr[0]).forEach(function(key) {
		if(key == "id") { return;}
		var th = document.createElement('th');
		th.appendChild(document.createTextNode( key));
		// th.setAttribute("id", 'thead' + key);
		th.onclick = function() { onTheadClick(key) };
		tr.appendChild(th);
	});
	thead.appendChild(tr);
	
	var tbody = document.createElement('tbody');
	state.playerArr.forEach( function( player) {
		var tr = document.createElement('tr');
		if ( state.id1 == player.id) {
			tr.className += "active";
		}
		if (state.id2 == player.id) {
			tr.className += "opponent";
		}
		Object.keys(player).forEach(function(key) {
			var td = document.createElement('td');
			// dont display id
			if(key == "id") {
				return;
			}
			if(key == "name") {
				td.appendChild( document.createTextNode(player[key]))
			}
			else {
				td.appendChild(document.createTextNode( player[key]));
			}
			tr.appendChild(td);
		})
		tr.onclick = function() { onPlayerClick(player.id)}
		tbody.appendChild(tr);
	});
	playersTable.appendChild(thead);
	playersTable.appendChild(tbody);
}

// View stuff
function displayPlayer(name, cWins, wins, losses, htmlId) {
	document.getElementById(htmlId + "Name")  
		.innerHTML =                                      name;
	document.getElementById(htmlId + "cWins") 
	  .innerHTML = "Capt vs Capt wins: "        + cWins;
	document.getElementById(htmlId + "Wins")  
		.innerHTML = "Wins: " 	+ wins;
	document.getElementById(htmlId + "Losses")
		.innerHTML = "Losses: " + losses;
}

function displayComparison(cData) {
	document.getElementById("matches").innerHTML 			= cData.matches;
	document.getElementById("bothWin").innerHTML 			= cData.bothWin;
	document.getElementById("bothLose").innerHTML 		= cData.bothLose;
	document.getElementById("bothCaptain").innerHTML 	= cData.bothCaptain;
	document.getElementById("ties").innerHTML 				= cData.ties;
}



state.chart1 = createChart("chart1");
state.chart2 = createChart("chart2");

function createChart(htmlId) {
	var ctx = document.getElementById(htmlId).getContext('2d');
	return new Chart(ctx, {
	    type: 'line',
	    data: data,
	    options: {
        scales: {
        		yAxes: [{ 
        				// ticks: {min: 0, max: 2}
        		}],

            xAxes: [{
                type: 'time',
                // time: {
                // 	unit: 'day'
                // }
                
            }]
        },
        responsive: true
    }
	});
}

// Utils
function cpm(player)
{	return (player.captained / player.matches);
}

// function CWR(player){}

// Compare functions for sorting
function compName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

function compCPM(a, b) {
	cpma = cpm(a);
	cpmb = cpm(b);
	
  return cpm(b) - cpm(a);
}

function compMatches(a,b){
	return b.matches - a.matches;
}

function compWin(a,b){
	return b.win - a.win;
}
function compLoss(a,b){
	return b.loss - a.loss;
}

function compCaptained(a,b) {
	return b.captained- a.captained;
}

function compCWR(a,b) {
	return parseInt( b.cwr ) - parseInt( a.cwr );
}

function compcwin(a,b) {
	return b.cwin- a.cwin;
}

function compcloss(a,b) {
	return b.closs- a.closs;
}




function addData(chart, data) {
    chart.data = data;
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

});














// relic code; url parameter navigation

function getIdLink(id,name) {
	var url_string = window.location.href
	var url = new URL(url_string);
	var noParams = window.location.href.split('?')[0];
	var a = document.createElement('a');
	var linkText = document.createTextNode(name);
	a.appendChild(linkText);

	// shitty "routing" state machine
	if ( url.searchParams.get("id2")) {
		if( url.searchParams.get("id1") === id || 
				url.searchParams.get("id2") === id ) { 
			a.href = noParams;
		} else {
			a.href = window.location.href.split('&')[0] + "&id2=" + id;
		}
		
	}
	else if ( url.searchParams.get("id1")) {
		if( url.searchParams.get("id1") === id) {
			a.href = noParams;
		} else {
			a.href = window.location + "&id2=" + id;
		}
	}
	else {
		a.href = noParams + "?id1=" + id;
	}
	return a;
}