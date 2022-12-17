"use strict";
function d6() {
    const min = 1;
    const max = 6;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function rerollProwess(dices, count) {
    const rerolls = [];
    for (let i = 0; i < dices.length; i++) {
        if (dices[i] === 1 && rerolls.length < count) {
            rerolls.push(i);
        }
    }
    if (rerolls.length < count) {
        const max = Math.max(...dices);
        if (max !== 6) {
            const targetMax = (dices.length - rerolls.length > 3) ? 5 : 4;
            if (max <= targetMax) {
                for (let n = 2; n <= 4; n++) {
                    for (let i = 0; i < dices.length; i++) {
                        if (dices[i] === n && rerolls.length < count) {
                            rerolls.push(i);
                        }
                    }
                }
            }
        }
    }
    for (const index of rerolls) {
        const dice = d6();
        dices[index] = dice;
    }
}
function rerollDodgeFeint(dices, count) {
    const rerolls = [];
    for (let i = 0; i < dices.length; i++) {
        if (dices[i] === 6 && rerolls.length < count) {
            rerolls.push(i);
        }
    }
    for (const index of rerolls) {
        const dice = d6();
        dices[index] = dice;
    }
}
function getTestResult(dices, kata) {
    if (!kata) {
        let i = 0;
        while (i < dices.length) {
            if (dices[i] === 1) {
                dices.splice(i, 1);
            }
            else {
                ++i;
            }
        }
    }
    if (dices.length === 0) {
        return -1;
    }
    const max = Math.max(...dices);
    if (dices.length === 1) {
        return max;
    }
    if (dices.length > 3) {
        return max + 2;
    }
    return max + dices.length - 1;
}
function getSucessLevels(sl, combo) {
    const levels = [];
    if (combo) {
        if (sl === 0 || sl === 1) {
            levels.push(sl, 0);
        }
        else {
            while (sl >= 0) {
                levels.push(sl);
                sl -= 2;
            }
        }
    }
    else if (sl >= 0) {
        levels.push(sl);
    }
    return levels;
}
function getWounds(dmgRollMod, sl, tough) {
    if (dmgRollMod < 2) {
        dmgRollMod = 2;
    }
    if (dmgRollMod > 12) {
        dmgRollMod = 12;
    }
    const dmgMod = [0, 0, -3, -2, -1, -1, 0, 0, 0, 1, 1, 2, 3];
    const wounds = sl + dmgMod[dmgRollMod] - tough;
    if (wounds < 0) {
        return 0;
    }
    return wounds;
}
function getMedian(arr) {
    if (arr.length == 0) {
        return NaN;
    }
    arr.sort((a, b) => a - b);
    const midpoint = Math.floor(arr.length / 2);
    return arr.length % 2 === 1 ? arr[midpoint] : (arr[midpoint - 1] + arr[midpoint]) / 2;
}
function getAverage(arr) {
    if (arr.length == 0) {
        return NaN;
    }
    return arr.reduce((a, b) => a + b) / arr.length;
}
function getStandardDeviation(arr) {
    if (arr.length == 0) {
        return NaN;
    }
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}
function insertThCell(tr, text) {
    const th = document.createElement('th');
    if (text) {
        th.innerText = text;
    }
    tr.appendChild(th);
}
function insertCell(tr, text) {
    const td = tr.insertCell();
    if (text) {
        td.innerText = text;
    }
}
function renderRangedTable(shortRangeWounds, mediumRangeWounds, longRangeWounds) {
    const table = document.createElement('table');
    table.classList.add('table');
    const head = table.createTHead();
    const headrow1 = head.insertRow();
    insertThCell(headrow1, 'Wounds');
    insertThCell(headrow1, 'Short range');
    insertThCell(headrow1, 'Medium range');
    insertThCell(headrow1, 'Long range');
    const body = table.createTBody();
    const shortRangeMedian = getMedian(shortRangeWounds);
    const mediumRangeMedian = getMedian(mediumRangeWounds);
    const longRangeMedian = getMedian(longRangeWounds);
    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Median');
    insertCell(bodyrow1, String(shortRangeMedian));
    insertCell(bodyrow1, String(mediumRangeMedian));
    insertCell(bodyrow1, String(longRangeMedian));
    const shortRangeAverage = getAverage(shortRangeWounds);
    const mediumRangeAverage = getAverage(mediumRangeWounds);
    const longRangeAverage = getAverage(longRangeWounds);
    const bodyrow2 = body.insertRow();
    insertThCell(bodyrow2, 'Average');
    insertCell(bodyrow2, String(shortRangeAverage.toFixed(2)));
    insertCell(bodyrow2, String(mediumRangeAverage.toFixed(2)));
    insertCell(bodyrow2, String(longRangeAverage.toFixed(2)));
    const shortRangeStdDev = getStandardDeviation(shortRangeWounds);
    const mediumRangeStdDev = getStandardDeviation(mediumRangeWounds);
    const longRangeStdDev = getStandardDeviation(longRangeWounds);
    const bodyrow3 = body.insertRow();
    insertThCell(bodyrow3, 'Standard deviation');
    insertCell(bodyrow3, String(shortRangeStdDev.toFixed(2)));
    insertCell(bodyrow3, String(mediumRangeStdDev.toFixed(2)));
    insertCell(bodyrow3, String(longRangeStdDev.toFixed(2)));
    return table;
}
function renderMeleeTable(hits, wounds) {
    const table = document.createElement('table');
    table.classList.add('table');
    const head = table.createTHead();
    const headrow1 = head.insertRow();
    insertThCell(headrow1);
    insertThCell(headrow1, 'Hit Rate');
    insertThCell(headrow1, 'Wounds');
    const body = table.createTBody();
    const median = getMedian(wounds);
    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Median');
    insertCell(bodyrow1);
    insertCell(bodyrow1, String(median));
    const averageHit = getAverage(hits) * 100;
    const averageWounds = getAverage(wounds);
    const bodyrow2 = body.insertRow();
    insertThCell(bodyrow2, 'Average');
    insertCell(bodyrow2, String(averageHit.toFixed(2)) + '%');
    insertCell(bodyrow2, String(averageWounds.toFixed(2)));
    const stddev = getStandardDeviation(wounds);
    const bodyrow3 = body.insertRow();
    insertThCell(bodyrow3, 'Standard deviation');
    insertCell(bodyrow3);
    insertCell(bodyrow3, String(stddev.toFixed(2)));
    return table;
}
const SIM_COUNT = 100000;
const btnCalcRanged = document.getElementById('ranged-calc');
btnCalcRanged.addEventListener('click', () => {
    const form = document.querySelector('#form-ranged');
    const valid = form.reportValidity();
    if (valid) {
        const inputPool = document.querySelector('#ranged-pool');
        const pool = Number(inputPool.value);
        const inputProwess = document.querySelector('#ranged-prowess');
        const prowess = Number(inputProwess.value);
        const inputBrutal = document.querySelector('#ranged-brutal');
        const brutal = Number(inputBrutal.value);
        const inputAttModifier = document.querySelector('#ranged-att-modifier');
        const attModifier = Number(inputAttModifier.value);
        const selectCombo = document.querySelector('#ranged-combo');
        const combo = Boolean(Number(selectCombo.value));
        const selectStrongWeak = document.querySelector('#ranged-strong-weak');
        const strong = Number(selectStrongWeak.value) === 1;
        const weak = Number(selectStrongWeak.value) === 2;
        const inputDmgModifier = document.querySelector('#ranged-dmg-modifier');
        const dmgModifier = Number(inputDmgModifier.value);
        const inputTough = document.querySelector('#ranged-tough');
        const tough = Number(inputTough.value);
        const shortRangeWounds = [];
        const mediumRangeWounds = [];
        const longRangeWounds = [];
        for (let x = 0; x < SIM_COUNT; x++) {
            const attDices = [];
            for (let i = 0; i < pool; i++) {
                const dice = d6();
                attDices.push(dice);
            }
            if (prowess) {
                rerollProwess(attDices, prowess);
            }
            const result = getTestResult(attDices, false);
            let shortRangeWound = 0;
            let mediumRangeWound = 0;
            let longRangeWound = 0;
            if (result !== -1) {
                const sl1 = result + brutal - (4 + attModifier);
                const shortRangeSLs = getSucessLevels(sl1, combo);
                const sl2 = result + brutal - (5 + attModifier);
                const mediumRangeSLs = getSucessLevels(sl2, combo);
                const sl3 = result + brutal - (6 + attModifier);
                const longRangeSLs = getSucessLevels(sl3, combo);
                for (let i = 0; i < shortRangeSLs.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices = [dice1, dice2];
                    if (strong) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => b - a);
                    }
                    else if (weak) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => a - b);
                    }
                    const dmgRoll = dmgDices.slice(0, 2).reduce((a, b) => a + b);
                    const dmgRollMod = dmgRoll + dmgModifier;
                    const sl1 = shortRangeSLs[i];
                    shortRangeWound += getWounds(dmgRollMod, sl1, tough);
                    const sl2 = mediumRangeSLs[i];
                    if (sl2 !== undefined) {
                        mediumRangeWound += getWounds(dmgRollMod, sl2, tough);
                    }
                    const sl3 = longRangeSLs[i];
                    if (sl3 !== undefined) {
                        longRangeWound += getWounds(dmgRollMod, sl3, tough);
                    }
                }
            }
            shortRangeWounds.push(shortRangeWound);
            mediumRangeWounds.push(mediumRangeWound);
            longRangeWounds.push(longRangeWound);
        }
        const table = renderRangedTable(shortRangeWounds, mediumRangeWounds, longRangeWounds);
        let text = 'Pool ' + pool + ' | Attack Challenge mod. ' + attModifier + ' | Damage mod. ' + dmgModifier;
        if (brutal) {
            text += ' | Brutal (' + brutal + ')';
        }
        if (prowess) {
            text += ' | Prowess (' + prowess + ')';
        }
        if (strong) {
            text += ' | Strong';
        }
        if (weak) {
            text += ' | Weak';
        }
        if (combo) {
            text += ' | Combo Attack';
        }
        if (tough) {
            text += ' | Tough (' + tough + ')';
        }
        const caption = table.createCaption();
        caption.innerText = text;
        const container = document.getElementById('ranged-result-container');
        while (container.firstChild) {
            container.firstChild.remove();
        }
        container.appendChild(table);
    }
});
const btnCalcMelee = document.getElementById('melee-calc');
btnCalcMelee.addEventListener('click', () => {
    const form = document.querySelector('#form-melee');
    const valid = form.reportValidity();
    if (valid) {
        const inputAttPool = document.querySelector('#melee-att-pool');
        const attPool = Number(inputAttPool.value);
        const inputDodge = document.querySelector('#melee-dodge');
        const dodge = Number(inputDodge.value);
        const inputAttProwess = document.querySelector('#melee-att-prowess');
        const attProwess = Number(inputAttProwess.value);
        const selectAttKata = document.querySelector('#melee-att-kata');
        const attKata = Boolean(Number(selectAttKata.value));
        const inputDefProwess = document.querySelector('#melee-def-prowess');
        const defProwess = Number(inputDefProwess.value);
        const inputFeint = document.querySelector('#melee-feint');
        const feint = Number(inputFeint.value);
        const selectDefKata = document.querySelector('#melee-def-kata');
        const defKata = Boolean(Number(selectDefKata.value));
        const inputBrutal = document.querySelector('#melee-brutal');
        const brutal = Number(inputBrutal.value);
        const inputParry = document.querySelector('#melee-parry');
        const parry = Number(inputParry.value);
        const inputDefPool = document.querySelector('#melee-def-pool');
        const defPool = Number(inputDefPool.value);
        const selectCombo = document.querySelector('#melee-combo');
        const combo = Boolean(Number(selectCombo.value));
        const selectStrongWeak = document.querySelector('#melee-strong-weak');
        const strong = Number(selectStrongWeak.value) === 1;
        const weak = Number(selectStrongWeak.value) === 2;
        const inputDmgModifier = document.querySelector('#melee-dmg-modifier');
        const dmgModifier = Number(inputDmgModifier.value);
        const inputTough = document.querySelector('#melee-tough');
        const tough = Number(inputTough.value);
        const hits = [];
        const wounds = [];
        for (let x = 0; x < SIM_COUNT; x++) {
            const attDices = [];
            for (let i = 0; i < attPool; i++) {
                const dice = d6();
                attDices.push(dice);
            }
            if (dodge) {
                rerollDodgeFeint(attDices, dodge);
            }
            if (attProwess) {
                rerollProwess(attDices, attProwess);
            }
            const attResult = getTestResult(attDices, attKata);
            let wound = 0;
            if (attResult !== -1) {
                const defDices = [];
                for (let i = 0; i < defPool; i++) {
                    const dice = d6();
                    defDices.push(dice);
                }
                if (defProwess) {
                    rerollProwess(defDices, defProwess);
                }
                if (feint) {
                    rerollDodgeFeint(defDices, feint);
                }
                const defResult = getTestResult(defDices, defKata);
                const sl = defResult === -1 ? attResult + brutal : attResult + brutal - (defResult + parry);
                const sucessLevels = getSucessLevels(sl, combo);
                if (sucessLevels.length) {
                    hits.push(1);
                }
                else {
                    hits.push(0);
                }
                for (let i = 0; i < sucessLevels.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices = [dice1, dice2];
                    if (strong) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => b - a);
                    }
                    else if (weak) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => a - b);
                    }
                    const dmgRoll = dmgDices.slice(0, 2).reduce((a, b) => a + b);
                    const dmgRollMod = dmgRoll + dmgModifier;
                    const sl = sucessLevels[i];
                    wound += getWounds(dmgRollMod, sl, tough);
                }
            }
            wounds.push(wound);
        }
        const table = renderMeleeTable(hits, wounds);
        const container = document.getElementById('melee-result-container');
        while (container.firstChild) {
            container.firstChild.remove();
        }
        container.appendChild(table);
    }
});
