addLayer("a", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
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
            done() {return player.p.points.greaterThanOrEqualTo(1)},
            tooltip: "Gain 1 prestige point.",
            image: './js/images/tft11.png'
        }, 
        12: {
            name: "Getting Serious",
            done() {return player.p.total.greaterThanOrEqualTo(10)},
            tooltip: "Make a total of 10 prestige points.",
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
            name: "what just happened",
            done() {return hasUpgrade("p", 31)},
            tooltip: "But the 7th prestige upgrade."
        },
        21: {
            name: "Now we're talking!",
            done() {return hasMilestone('s', 0) && hasMilestone('t', 0)},
            tooltip: "Get all Row 2 milestones."
        }
    }
})
addLayer("m", {
    name: "meta", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#00FF00",
    tooltip: "Meta",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row) 
    tabFormat: {
        "Upgrade Tree": {
            content: [
                ["display-text",
                     "Upgrades in the upgrade tree are unlocked after reaching certain acheiements. They are usually synergy upgrades between layers."],
                "blank",
                "blank",
                "upgrades"
            ]
        }
    },
    upgrades: {
        11: {
            title: "Manipulate Time",
            description: "Your playtime boosts point gain.",
            cost: new Decimal(1e12),
            currencyDisplayName: "Points",
            currencyInternalName: "points",
            unlocked() {return hasAchievement("a", 15)},
            effect() {
                return ((player.timePlayed/86400)+1)**1.25
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

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
    softcap: new Decimal(1e9),
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
        mult = mult.times(tmp.s.effect)
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
            cost: new Decimal(5),
            effect() {
                if (hasUpgrade('p', 31)){return player[this.layer].points.pow(1.1)}
                return player[this.layer].points.add(2.5).log(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 11)}
        },
        13: {
            title: "More Boosting.",
            description: "Points boost themselves.",
            cost: new Decimal(10),
            effect() {
                return player.points.add(2).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 12)}
        },
        21: {
            title: "Even More Boosting.",
            description: "Points boost prestige point gain.",
            cost: new Decimal(25),
            effect() {
                return player.points.add(2.3).log(2.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 13)}
        },
        22: {
            title: "Even Even More Boosting.",
            description: "Prestige points boost themselves.",
            cost: new Decimal(100),
            effect() {
                return player[this.layer].points.add(3).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 21)}
        },
        23: {
            title: "",
            description: "Prestige points add to both time base and speed base.",
            cost: new Decimal(5000),
            effect() {
                return player[this.layer].points.add(3).pow(0.10)
            },
            effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 22)&&player.s.unlocked&&player.t.unlocked}
        },
        31: {
            title: "'progress'",
            description: "Make the <b>Boost</b> upgrade formula a lot better.",
            cost: new Decimal(1e7),
            unlocked() {return hasUpgrade('p', 23)}
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
    requires: new Decimal(5000), // Can be a function that takes requirement increases into account
    resource: "speed points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 3, // Prestige currency exponent
    effect(){
        let eff = new Decimal(2)
        if (hasUpgrade('s', 12)) eff = eff.add(upgradeEffect('s', 12))
        if (hasUpgrade('p', 23)) eff = eff.add(upgradeEffect('p', 23))
        if (hasUpgrade('s', 13)) eff = eff.add(upgradeEffect('s', 13))

        eff = eff.pow(player[this.layer].points)
        return eff
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
				function() {return 'You have ' + format(player.s.points) + ' Speed, which boosts Prestige Point generation by '+format(tmp.s.effect)+'x.'},
					{}],
			"blank",
			["display-text",
				function() {return 'Your best Speed is ' + formatWhole(player.s.best) + '.<br>You have made a total of '+formatWhole(player.s.total)+" Speed."},
					{}],
			"blank",
			"milestones", "blank", "blank", "upgrades"],
    upgrades: {
        11: {
            title: "fast",
            description: "Speed boosts point gain.",
            cost: new Decimal(2),
            effect() {
                    return player[this.layer].points.add(1.5).pow((!hasUpgrade('s', 22)?0.4:0.5))  //this is my first time using the "if" thingy lol
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "faster",
            description: "Time adds to the speed base.",
            cost: new Decimal(3),
            effect() {
                return player.t.points.pow(0.1).div(3.16227766017)
            },
            unlocked() {return player.t.total.gte(1)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"+" },
        },
        13: {
            title: "upgrade name here",
            description: "Speed boosts itself.",
            cost: new Decimal(5),
            effect() {
                return new Decimal.log(player.s.points.add(2), 10)
            },
            unlocked() {return hasUpgrade("s", 12)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"+" },
        },
        21: {
            title: "Double Second Row",
            description: "Speed makes ticks and speed cheaper.",
            cost: new Decimal(5),
            effect() {
                return new Decimal.log(player.s.points.add(2), 20)
            },
            unlocked() {return hasUpgrade("s", 13)},
            effectDisplay() { return format("-" + upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "Better Speed",
            description: "Make the <b>fast</b> upgrade formula better.",
            cost: new Decimal(7),
            unlocked() {return hasUpgrade("s", 21)},
        }
    },
    milestones: {
        0: {
            requirementDescription: "5 speed points",
            effectDescription: "Keep prestige points on speed reset.",
            done() { return player.s.points.gte(5)}
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
    requires: new Decimal(5000), // Can be a function that takes requirement increases into account
    resource: "ticks", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ['p'],
    layerShown(){return ((hasUpgrade('p', 22)) || (player[this.layer].total.gte(new Decimal(1))))},
    hotkeys: [
        {key: "t", description: "T: Reset for ticks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ], 
    effect() {
        let eff = new Decimal(0.2)
        if (hasUpgrade('t', 12)) eff = eff.add(upgradeEffect('t', 12))
        if (hasUpgrade('p', 23)) eff = eff.add(upgradeEffect('p', 23))
        if (hasUpgrade('t', 21)) eff = eff.times(5)

        eff = eff.times(player[this.layer].points)
        return eff
    },  
    powerEffect() {
        return player[this.layer].power.add(1).pow(0.5)
    },
    update(diff) {
        if(player[this.layer].total.gte(new Decimal(1))) {player[this.layer].power = player[this.layer].power.plus(tmp[this.layer].effect.times(diff))}
    },
    doReset(resettingLayer) {
        player[this.layer].power = new Decimal(0)
    },
    tabFormat: ["main-display",
    "prestige-button",
    "blank",
    ["display-text", function() {return 'Your ticks are producing ' + format(tmp[this.layer].effect) + ' time per second.'}],
    "blank",
    ["display-text",
        function() {return 'You have ' + format(player[this.layer].power) + ' Time, which boosts Prestige Point generation by '+format(tmp[this.layer].powerEffect)+'x.'},
            {}],
    "blank",
    ["display-text",
        function() {return 'Your best ticks is ' + formatWhole(player[this.layer].best) + '.<br>You have made a total of '+formatWhole(player[this.layer].total)+" Ticks."},
            {}],
    "blank",
    "milestones", "blank", "blank", "upgrades"],
    upgrades: {
        11: {
            title: "Tick",
            description: "Ticks boost point gain.",
            cost: new Decimal(2),
            effect() {
                if (hasUpgrade('t', 22)){
                    return player[this.layer].points.add(1.5).pow(0.5)
                }
                return player[this.layer].points.add(1.5).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        }, 
        12: {
            title: "Tock",
            description: "Speed adds to the time base effect.",
            cost: new Decimal(3),
            unlocked() {return player.s.total.gte(1)},
            effect() {
                return player.s.points.pow(0.1).div(3.16227766017)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"+" },

        },
        13: {
            title: "There are no differences in the row 2 upgrades",
            description: "take a guess",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("t", 12)},
            effect() {
                return new Decimal.log(player[this.layer].points.add(2), 10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"+" },

        },
        21: {
            title: "lazy power",
            description: "5x boost to time gain.",
            unlocked() {return hasUpgrade("t", 13)},
            cost: new Decimal(7),
        },
        22: {
            title: "Better clocks",
            description: "Make the <b>Tick</b> upgrade formula better.",
            unlocked() {return hasUpgrade("t", 21)},
            cost: new Decimal(7),
        }
    },
    milestones: {
        0: {
            requirementDescription: "5 ticks",
            effectDescription: "Keep prestige points on tick reset.",
            done() { return player[this.layer].points.gte(5) }
        }
    }
})
