let modInfo = {
	name: "The Final Tree",
	id: "tFttekpixels",
	author: "tekpixels",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 999999999,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Row 2!",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1</h3><br>
	<h2>Dec 20, 2023</h2><br>
		-Fixed Prestige formlulas.<br>
		-Greatly reduced endgame requirement.<br>
		-Added Time.<br>
		-Fixed Speed formulas.<br>
	<br><br><h3>v0.0</h3><br>
	<h2>Dec 18, 2023</h2><br>
		-Released game.`

let winText = `Good job! That wasn't very hard, but wait for 0.2.... or just get back to work.`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	if (hasUpgrade('p', 11)) gain = gain.add(1)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('s', 11)) gain = gain.times(upgradeEffect('s', 11))
	gain = gain.times(new Decimal(2).pow(player.s.points))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = ['Current endgame: 1e9 points'
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1000000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}