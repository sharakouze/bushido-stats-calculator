function d6(): number {
    const min = 1;
    const max = 6;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function rerollProwess(dices: number[], count: number): void {
    const rerolls: number[] = [];

    // reroll 1's
    for (let i = 0; i < dices.length; i++) {
        if (dices[i] === 1 && rerolls.length < count) {
            rerolls.push(i);
        }
    }

    if (rerolls.length < count) {
        // no need to risk rerolls if max dice is 6
        const max = Math.max(...dices);
        if (max !== 6) {
            // we risk to reroll dices only if the max dice is less or equals than 4 (or 5 if the pool is greater than 3 dices)
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

function rerollDodgeFeint(dices: number[], count: number): void {
    const rerolls: number[] = [];

    // reroll 6's
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

function getTestResult(dices: number[], kata: boolean): number {
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

function getSucessLevels(sl: number, combo: boolean) {
    const levels: number[] = [];
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

function getWounds(dmgRollMod: number, sl: number, tough: number) {
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

function getMedian(arr: number[]): number {
    if (arr.length == 0) {
        return NaN;
    }
    arr.sort((a, b) => a - b);
    const midpoint = Math.floor(arr.length / 2);
    return arr.length % 2 === 1 ? arr[midpoint] : (arr[midpoint - 1] + arr[midpoint]) / 2;
}

function getAverage(arr: number[]): number {
    if (arr.length == 0) {
        return NaN;
    }
    return arr.reduce((a, b) => a + b) / arr.length;
}

function getStandardDeviation(arr: number[]): number {
    if (arr.length == 0) {
        return NaN;
    }
    const n = arr.length
    const mean = arr.reduce((a, b) => a + b) / n
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function insertThCell(tr: HTMLTableRowElement, text?: string) {
    const th = document.createElement('th');
    if (text) {
        th.innerText = text;
    }
    tr.appendChild(th);
}
function insertCell(tr: HTMLTableRowElement, text?: string) {
    const td = tr.insertCell();
    if (text) {
        td.innerText = text;
    }
}

function renderRangedTable(shortRangeHits: boolean[], mediumRangeHits: boolean[], longRangeHits: boolean[],
    shortRangeWounds: number[], mediumRangeWounds: number[], longRangeWounds: number[]): HTMLTableElement {
    const table = document.createElement('table');
    table.classList.add('table');

    const head = table.createTHead();

    const headrow1 = head.insertRow();
    insertThCell(headrow1);
    insertThCell(headrow1, 'Hit rate');
    insertThCell(headrow1, 'Median wounds');
    insertThCell(headrow1, 'Average wounds');

    const body = table.createTBody();

    const shortRangeHitRate = getAverage(shortRangeHits.map(x => x ? 100 : 0));
    const shortRangeMedianW = getMedian(shortRangeWounds);
    const shortRangeAvgW = getAverage(shortRangeWounds);

    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Short range');
    insertCell(bodyrow1, String(shortRangeHitRate.toFixed(1)) + '%');
    insertCell(bodyrow1, String(shortRangeMedianW));
    insertCell(bodyrow1, String(shortRangeAvgW.toFixed(2)));

    const mediumRangeHitRate = getAverage(mediumRangeHits.map(x => x ? 100 : 0));
    const mediumRangeMedianW = getMedian(mediumRangeWounds);
    const mediumRangeAvgW = getAverage(mediumRangeWounds);

    const bodyrow2 = body.insertRow();
    insertThCell(bodyrow2, 'Medium range');
    insertCell(bodyrow2, String(mediumRangeHitRate.toFixed(1)) + '%');
    insertCell(bodyrow2, String(mediumRangeMedianW));
    insertCell(bodyrow2, String(mediumRangeAvgW.toFixed(2)));

    const longRangeHitRate = getAverage(longRangeHits.map(x => x ? 100 : 0));
    const longRangeMedianW = getMedian(longRangeWounds);
    const longRangeAvgW = getAverage(longRangeWounds);

    const bodyrow3 = body.insertRow();
    insertThCell(bodyrow3, 'Long range');
    insertCell(bodyrow3, String(longRangeHitRate.toFixed(1)) + '%');
    insertCell(bodyrow3, String(longRangeMedianW));
    insertCell(bodyrow3, String(longRangeAvgW.toFixed(2)));

    return table;
}

function renderMeleeTable(hits: boolean[], wounds: number[]): HTMLTableElement {
    const table = document.createElement('table');
    table.classList.add('table');

    const head = table.createTHead();

    const headrow1 = head.insertRow();
    insertThCell(headrow1);
    insertThCell(headrow1, 'Hit rate');
    insertThCell(headrow1, 'Median wounds');
    insertThCell(headrow1, 'Average wounds');

    const body = table.createTBody();

    const hitRate = getAverage(hits.map(x => x ? 100 : 0));
    const medianWounds = getMedian(wounds);
    const averageWounds = getAverage(wounds);

    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Melee');
    insertCell(bodyrow1, String(hitRate.toFixed(1)) + '%');
    insertCell(bodyrow1, String(medianWounds));
    insertCell(bodyrow1, String(averageWounds.toFixed(2)));

    return table;
}

const SIM_COUNT = 100000;

const btnCalcRanged = document.getElementById('ranged-calc');
btnCalcRanged!.addEventListener('click', () => {
    const form = document.querySelector<HTMLFormElement>('#form-ranged');
    const valid = form!.reportValidity();
    if (valid) {
        const inputPool = document.querySelector<HTMLInputElement>('#ranged-pool');
        const pool = Number(inputPool!.value);

        const inputProwess = document.querySelector<HTMLInputElement>('#ranged-prowess');
        const prowess = Number(inputProwess!.value);

        const inputBrutal = document.querySelector<HTMLInputElement>('#ranged-brutal');
        const brutal = Number(inputBrutal!.value);

        const inputAttModifier = document.querySelector<HTMLInputElement>('#ranged-att-modifier');
        const attModifier = Number(inputAttModifier!.value);

        const selectCombo = document.querySelector<HTMLSelectElement>('#ranged-combo');
        const combo = Boolean(Number(selectCombo!.value));

        const selectStrongWeak = document.querySelector<HTMLSelectElement>('#ranged-strong-weak');
        const strong = Number(selectStrongWeak!.value) === 1;
        const weak = Number(selectStrongWeak!.value) === 2;

        const inputDmgModifier = document.querySelector<HTMLInputElement>('#ranged-dmg-modifier');
        const dmgModifier = Number(inputDmgModifier!.value);

        const inputTough = document.querySelector<HTMLInputElement>('#ranged-tough');
        const tough = Number(inputTough!.value);

        const shortRangeHits: boolean[] = [];
        const mediumRangeHits: boolean[] = [];
        const longRangeHits: boolean[] = [];

        const shortRangeWounds: number[] = [];
        const mediumRangeWounds: number[] = [];
        const longRangeWounds: number[] = [];

        for (let x = 0; x < SIM_COUNT; x++) {
            const attDices: number[] = [];
            for (let i = 0; i < pool; i++) {
                const dice = d6();
                attDices.push(dice);
            }

            if (prowess) {
                rerollProwess(attDices, prowess);
            }

            const result = getTestResult(attDices, false);

            let shortRangeHit = false;
            let mediumRangeHit = false;
            let longRangeHit = false;

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

                shortRangeHit = shortRangeSLs.length ? true : false;
                mediumRangeHit = mediumRangeSLs.length ? true : false;
                longRangeHit = longRangeSLs.length ? true : false;

                for (let i = 0; i < shortRangeSLs.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices: number[] = [dice1, dice2];

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

            shortRangeHits.push(shortRangeHit);
            mediumRangeHits.push(mediumRangeHit);
            longRangeHits.push(longRangeHit);

            shortRangeWounds.push(shortRangeWound);
            mediumRangeWounds.push(mediumRangeWound);
            longRangeWounds.push(longRangeWound);
        }

        const table = renderRangedTable(shortRangeHits, mediumRangeHits, longRangeHits, shortRangeWounds, mediumRangeWounds, longRangeWounds);

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
        while (container!.firstChild) {
            container!.firstChild.remove();
        }
        container!.appendChild(table);
    }
});

const btnCalcMelee = document.getElementById('melee-calc');
btnCalcMelee!.addEventListener('click', () => {
    const form = document.querySelector<HTMLFormElement>('#form-melee');
    const valid = form!.reportValidity();
    if (valid) {
        const inputAttPool = document.querySelector<HTMLInputElement>('#melee-att-pool');
        const attPool = Number(inputAttPool!.value);

        const inputDodge = document.querySelector<HTMLInputElement>('#melee-dodge');
        const dodge = Number(inputDodge!.value);

        const inputAttProwess = document.querySelector<HTMLInputElement>('#melee-att-prowess');
        const attProwess = Number(inputAttProwess!.value);

        const selectAttKata = document.querySelector<HTMLInputElement>('#melee-att-kata');
        const attKata = Boolean(Number(selectAttKata!.value));

        const inputDefProwess = document.querySelector<HTMLInputElement>('#melee-def-prowess');
        const defProwess = Number(inputDefProwess!.value);

        const inputFeint = document.querySelector<HTMLInputElement>('#melee-feint');
        const feint = Number(inputFeint!.value);

        const selectDefKata = document.querySelector<HTMLInputElement>('#melee-def-kata');
        const defKata = Boolean(Number(selectDefKata!.value));

        const inputBrutal = document.querySelector<HTMLInputElement>('#melee-brutal');
        const brutal = Number(inputBrutal!.value);

        const inputParry = document.querySelector<HTMLInputElement>('#melee-parry');
        const parry = Number(inputParry!.value);

        const inputDefPool = document.querySelector<HTMLInputElement>('#melee-def-pool');
        const defPool = Number(inputDefPool!.value);

        const selectCombo = document.querySelector<HTMLSelectElement>('#melee-combo');
        const combo = Boolean(Number(selectCombo!.value));

        const selectStrongWeak = document.querySelector<HTMLSelectElement>('#melee-strong-weak');
        const strong = Number(selectStrongWeak!.value) === 1;
        const weak = Number(selectStrongWeak!.value) === 2;

        const inputDmgModifier = document.querySelector<HTMLInputElement>('#melee-dmg-modifier');
        const dmgModifier = Number(inputDmgModifier!.value);

        const inputTough = document.querySelector<HTMLInputElement>('#melee-tough');
        const tough = Number(inputTough!.value);

        const attackerActive = true;

        const hits: boolean[] = [];
        const wounds: number[] = [];

        for (let x = 0; x < SIM_COUNT; x++) {
            const attDices: number[] = [];
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

            let hit = false;
            let wound = 0;

            if (attResult !== -1) {
                const defDices: number[] = [];
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

                let sl = (defResult === -1) ? attResult + brutal : attResult + brutal - (defResult + parry);
                if (sl === 0) {
                    if (attDices.length < defDices.length) {
                        sl = -1;
                    }
                    else if (attDices.length === defDices.length && !attackerActive) {
                        sl = -1;
                    }
                }

                const sucessLevels = getSucessLevels(sl, combo);

                hit = sucessLevels.length ? true : false;

                for (let i = 0; i < sucessLevels.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices: number[] = [dice1, dice2];

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

            hits.push(hit);
            wounds.push(wound);
        }

        const table = renderMeleeTable(hits, wounds);

        let text = 'Att. Pool ' + attPool + ' | Def. Pool ' + defPool + ' | Damage mod. ' + dmgModifier;
        if (brutal) {
            text += ' | Brutal (' + brutal + ')';
        }
        if (attProwess) {
            text += ' | Prowess [Attack] (' + attProwess + ')';
        }
        if (defProwess) {
            text += ' | Prowess [Defence] (' + defProwess + ')';
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
        const container = document.getElementById('melee-result-container');
        while (container!.firstChild) {
            container!.firstChild.remove();
        }
        container!.appendChild(table);
    }
});
