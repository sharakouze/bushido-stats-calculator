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
    /*
        if (rerolls.length < count) {
            const max = Math.max(...dices);
            if (max !== 6) {
                for (let i = 0; i < dices.length; i++) {
                    if (dices[i] === 1 && rerolls.length < count) {
                        rerolls.push(i);
                    }
                }
            }
        }
    */
    for (const index of rerolls) {
        const dice = d6();
        dices[index] = dice;
    }
}
function getTestResult(dices) {
    let i = 0;
    while (i < dices.length) {
        if (dices[i] === 1) {
            dices.splice(i, 1);
        }
        else {
            ++i;
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
function getWounds(dmgRollMod, sl) {
    if (dmgRollMod < 2) {
        dmgRollMod = 2;
    }
    if (dmgRollMod > 12) {
        dmgRollMod = 12;
    }
    const dmgMod = [0, 0, -3, -2, -1, -1, 0, 0, 0, 1, 1, 2, 3];
    const wounds = sl + dmgMod[dmgRollMod];
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
function renderRangedTable(shortRangeWounds, mediumRangeWounds, longRangeWounds) {
    const table = document.createElement('table');
    table.classList.add('table');
    const head = table.createTHead();
    const headrow = head.insertRow();
    const headcell0 = document.createElement('th');
    headcell0.innerText = 'Wounds';
    headrow.appendChild(headcell0);
    const headcell1 = document.createElement('th');
    headcell1.innerText = 'Short range';
    headcell1.scope = 'col';
    headrow.appendChild(headcell1);
    const headcell2 = document.createElement('th');
    headcell2.innerText = 'Medium range';
    headcell2.scope = 'col';
    headrow.appendChild(headcell2);
    const headcell3 = document.createElement('th');
    headcell3.innerText = 'Long range';
    headcell3.scope = 'col';
    headrow.appendChild(headcell3);
    const body = table.createTBody();
    const shortRangeMedian = getMedian(shortRangeWounds);
    const mediumRangeMedian = getMedian(mediumRangeWounds);
    const longRangeMedian = getMedian(longRangeWounds);
    const bodyrow1 = body.insertRow();
    const row1cell0 = document.createElement('th');
    row1cell0.innerText = 'Median';
    row1cell0.scope = 'row';
    bodyrow1.appendChild(row1cell0);
    const row1cell1 = bodyrow1.insertCell();
    row1cell1.innerText = String(shortRangeMedian);
    const row1cell2 = bodyrow1.insertCell();
    row1cell2.innerText = String(mediumRangeMedian);
    const row1cell3 = bodyrow1.insertCell();
    row1cell3.innerText = String(longRangeMedian);
    const shortRangeAverage = getAverage(shortRangeWounds);
    const mediumRangeAverage = getAverage(mediumRangeWounds);
    const longRangeAverage = getAverage(longRangeWounds);
    const bodyrow2 = body.insertRow();
    const row2cell0 = document.createElement('th');
    row2cell0.innerText = 'Average';
    row2cell0.scope = 'row';
    bodyrow2.appendChild(row2cell0);
    const row2cell1 = bodyrow2.insertCell();
    row2cell1.innerText = String(shortRangeAverage.toFixed(2));
    const row2cell2 = bodyrow2.insertCell();
    row2cell2.innerText = String(mediumRangeAverage.toFixed(2));
    const row2cell3 = bodyrow2.insertCell();
    row2cell3.innerText = String(longRangeAverage.toFixed(2));
    const shortRangeStdDev = getStandardDeviation(shortRangeWounds);
    const mediumRangeStdDev = getStandardDeviation(mediumRangeWounds);
    const longRangeStdDev = getStandardDeviation(longRangeWounds);
    const bodyrow3 = body.insertRow();
    const row3cell0 = document.createElement('th');
    row3cell0.innerText = 'Standard deviation';
    row3cell0.scope = 'row';
    bodyrow3.appendChild(row3cell0);
    const row3cell1 = bodyrow3.insertCell();
    row3cell1.innerText = String(shortRangeStdDev.toFixed(2));
    const row3cell2 = bodyrow3.insertCell();
    row3cell2.innerText = String(mediumRangeStdDev.toFixed(2));
    const row3cell3 = bodyrow3.insertCell();
    row3cell3.innerText = String(longRangeStdDev.toFixed(2));
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
        const selectStrong = document.querySelector('#ranged-strong');
        const strong = Boolean(Number(selectStrong.value));
        const inputDmgModifier = document.querySelector('#ranged-dmg-modifier');
        const dmgModifier = Number(inputDmgModifier.value);
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
            const result = getTestResult(attDices);
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
                    const dmgRoll = dmgDices.slice(0, 2).reduce((a, b) => a + b);
                    const dmgRollMod = dmgRoll + dmgModifier;
                    const sl1 = shortRangeSLs[i];
                    shortRangeWound += getWounds(dmgRollMod, sl1);
                    const sl2 = mediumRangeSLs[i];
                    if (sl2 !== undefined) {
                        mediumRangeWound += getWounds(dmgRollMod, sl2);
                    }
                    const sl3 = longRangeSLs[i];
                    if (sl3 !== undefined) {
                        longRangeWound += getWounds(dmgRollMod, sl3);
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
        if (combo) {
            text += ' | Combo Attack';
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
