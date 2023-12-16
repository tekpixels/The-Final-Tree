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
        if (hasMilestone('s', 0)) mult = mult.times(player.s.points.pow(0.10))
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
                return player[this.layer].points.add(1).pow(0.75)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 11)}
        },
        13: {
            title: "More Boosting.",
            description: "Points boost themselves.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 12)}
        },
        21: {
            title: "Even More Boosting.",
            description: "Points boost prestige point gain.",
            cost: new Decimal(10),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('p', 13)}
        },
        22: {
            title: "Even Even More Boosting.",
            description: "Prestige points boost themselves.",
            cost: new Decimal(25),
            effect() {
                return player[this.layer].points.add(1).pow(0.10)
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
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF8888",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "speed points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for speed points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],  
    upgrades: {
        11: {
            title: "s p e e d",
            description: "Speed boosts point gain.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.40)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

        }
    },
    milestones: {
        0: {
            requirementDescription: "2 speed points",
            effectDescription: "Speed boosts prestige points.",
            done() { return player.s.points.gte(2) }
        }
    }
})
