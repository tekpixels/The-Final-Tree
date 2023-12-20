addLayer("a", {
    name: "Achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#FFFF00",
    tooltip: "Achievements",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row) 
    achievements: {
        11: {
            name: "The journey begins",
            done() {return player.points.greaterThanOrEqualTo(1)},
            tooltip: "Gain 1 point."
        }, 
        12: {
            name: "Getting Serious",
            done() {return player.p.total.greaterThanOrEqualTo(10)},
            tooltip: "Make a total of 10 prestige points."
        },
        13: {
            name: "Boom shakalaka",
            done() {return player.s.total.greaterThanOrEqualTo(1) || player.t.total.greaterThanOrEqualTo(1)},
            tooltip: "Perform a row 2 reset."
        },
        14: {
            name: "unlock order cost scaling should really be implemented in the next row",
            done() {return player.s.total.greaterThanOrEqualTo(1) && player.t.total.greaterThanOrEqualTo(1)},
            tooltip: "Unlock all row 2 layers."
        },
        15: {
            name: "pro",
            done() {return player.points.greaterThanOrEqualTo(1000000000)},
            tooltip: "Have 1e9 points."
        }
    }
})
addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
        if (hasUpgrade('p', 22)) mult = mult.times(upgradeEffect('p', 22))
        mlut = mult.times(player.s.effect)
        mult = mult.times(tmp.t.powerEffect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
        let keep = []
        if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("upgrades")
        if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
    },
    upgrades: {
        11: {
            title: "Start.",
            description: "Produce 1 point per second.",
            cost: new Decimal(1)
        },
        12: {
            title: "Boost.",
            description: "Prestige points boost point gain.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(3).log(2.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 11)}
        },
        13: {
            title: "More Boosting.",
            description: "Points boost themselves.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(3).log(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 12)}
        },
        21: {
            title: "Even More Boosting.",
            description: "Points boost prestige point gain.",
            cost: new Decimal(10),
            effect() {
                return player.points.add(2.3).log(2.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 13)}
        },
        22: {
            title: "Even Even More Boosting.",
            description: "Prestige points boost themselves.",
            cost: new Decimal(25),
            effect() {
                return player[this.layer].points.add(3).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 21)}
        }
    },
})
addLayer("s", {
    name: "speed", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF8888",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "speed points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    effect(){
        return (new Decimal(2).add(upgradeEffect('s', 12)).pow(player[this.layer].points))
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ['p'],
    layerShown(){return ((hasUpgrade('p', 22)) || (player[this.layer].total.greaterThanOrEqualTo(new Decimal(1))))},
    hotkeys: [
        {key: "s", description: "S: Reset for speed points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],  
    tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.s.points) + ' Speed, which boosts Prestige Point generation by '+format(tmp.s.effect)+'x'},
					{}],
			"blank",
			["display-text",
				function() {return 'Your best Speed is ' + formatWhole(player.s.best) + '<br>You have made a total of '+formatWhole(player.s.total)+" Speed."},
					{}],
			"blank",
			"milestones", "blank", "blank", "upgrades"],
    upgrades: {
        11: {
            title: "fast",
            description: "Speed boosts point gain.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        },
        12: {
            title: "faster",
            description: "Time boosts the speed base.",
            cost: new Decimal(3),
            effect() {
                return player.t.points.pow(0.1).div(3.16227766017)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        }
    },
    milestones: {
        0: {
            requirementDescription: "2 speed points",
            effectDescription: "Keep prestige points on speed reset.",
            done() { return player.s.points.gte(2) }
        }
    }
})
addLayer("t", {
    name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: new Decimal(0)
    }},
    color: "#8888FF",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "ticks", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ['p'],
    layerShown(){return ((hasUpgrade('p', 22)) || (player[this.layer].total.greaterThanOrEqualTo(new Decimal(1))))},
    hotkeys: [
        {key: "t", description: "T: Reset for ticks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ], 
    effect() {
        let eff = player.t.points.add(upgradeEffect('s', 12))
        return eff;
    },  
    powerEffect() {
        return player.t.power.add(1).pow(0.5)
    },
    update(diff) {
        player.t.power = player.t.power.plus(tmp.t.effect.times(diff))
    },
    doReset(resettingLayer) {
        player.t.power = new Decimal(0)
    },
    tabFormat: ["main-display",
    "prestige-button",
    "blank",
    ["display-text", function() {return 'Your ticks are producing ' + format(tmp.t.effect) + ' time per second.'}],
    "blank",
    ["display-text",
        function() {return 'You have ' + format(player.t.power) + ' Time, which boosts Prestige Point generation by '+format(tmp.t.powerEffect)+'x'},
            {}],
    "blank",
    ["display-text",
        function() {return 'Your best Ticks is ' + formatWhole(player.t.best) + '<br>You have made a total of '+formatWhole(player.t.total)+" Ticks."},
            {}],
    "blank",
    "milestones", "blank", "blank", "upgrades"],
    upgrades: {
        11: {
            title: "Tick",
            description: "Time boosts point gain.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        }, 
        12: {
            title: "Tock",
            description: "Speed boosts the time base effect.",
            cost: new Decimal(3),
            effect() {
                return player.s.points.pow(0.1).div(3.16227766017)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        }
    },
    milestones: {
        0: {
            requirementDescription: "2 ticks",
            effectDescription: "Keep prestige points on tick reset.",
            done() { return player.t.points.gte(2) }
        }
    }
})
