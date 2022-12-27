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

    if (rerolls.length < count) {
        // count number of occurence of 5's
        const n = dices.reduce((p, c) => c === 5 ? p + 1 : p, 0);
        // if we can reroll all the 5's
        if (rerolls.length + n <= count) {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i] === 5 && rerolls.length < count) {
                    rerolls.push(i);
                }
            }
        }
    }

    for (const index of rerolls) {
        const dice = d6();
        dices[index] = dice;
    }
}

function getTestResult(dices: number[], kata: boolean, removeHighest: number): number {
    if (!kata) {
        // remove 1's from the pool
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

    // remove x highest dices
    while (removeHighest > 0) {
        const max = Math.max(...dices);
        const index = dices.indexOf(max);
        if (index !== -1) {
            dices.splice(index, 1);
        }
        removeHighest--;
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

function getSucessLevels(sl: number, combo: boolean): number[] {
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

function getWounds(dmgRollMod: number, sl: number, tough: number): number {
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

function insertThCell(tr: HTMLTableRowElement, text?: string): void {
    const th = document.createElement('th');
    if (text) {
        th.innerText = text;
    }
    tr.appendChild(th);
}
function insertCell(tr: HTMLTableRowElement, text?: string): void {
    const td = tr.insertCell();
    if (text) {
        td.innerText = text;
    }
}

interface IRangedResult {
    values: {
        pool: number,
        attModifier: number,
        dmgModifier: number,
        brutal: number,
        prowess: number,
        strong: boolean,
        weak: boolean,
        combo: boolean,
        tough: number,
    },
    short: {
        hits: boolean[],
        wounds: number[],
    },
    medium: {
        hits: boolean[],
        wounds: number[],
    },
    long: {
        hits: boolean[],
        wounds: number[],
    },
}

function renderRangedTable(result: IRangedResult): void {
    const table = document.createElement('table');
    table.classList.add('table');

    const head = table.createTHead();

    const headrow1 = head.insertRow();
    insertThCell(headrow1);
    insertThCell(headrow1, 'Hit rate');
    insertThCell(headrow1, 'Median wounds');
    insertThCell(headrow1, 'Average wounds');

    const body = table.createTBody();

    const shortRangeHitRate = getAverage(result.short.hits.map(x => x ? 100 : 0));
    const shortRangeMedianW = getMedian(result.short.wounds);
    const shortRangeAvgW = getAverage(result.short.wounds);

    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Short range');
    insertCell(bodyrow1, String(shortRangeHitRate.toFixed(2)) + '%');
    insertCell(bodyrow1, String(shortRangeMedianW));
    insertCell(bodyrow1, String(shortRangeAvgW.toFixed(2)));

    const mediumRangeHitRate = getAverage(result.medium.hits.map(x => x ? 100 : 0));
    const mediumRangeMedianW = getMedian(result.medium.wounds);
    const mediumRangeAvgW = getAverage(result.medium.wounds);

    const bodyrow2 = body.insertRow();
    insertThCell(bodyrow2, 'Medium range');
    insertCell(bodyrow2, String(mediumRangeHitRate.toFixed(2)) + '%');
    insertCell(bodyrow2, String(mediumRangeMedianW));
    insertCell(bodyrow2, String(mediumRangeAvgW.toFixed(2)));

    const longRangeHitRate = getAverage(result.long.hits.map(x => x ? 100 : 0));
    const longRangeMedianW = getMedian(result.long.wounds);
    const longRangeAvgW = getAverage(result.long.wounds);

    const bodyrow3 = body.insertRow();
    insertThCell(bodyrow3, 'Long range');
    insertCell(bodyrow3, String(longRangeHitRate.toFixed(2)) + '%');
    insertCell(bodyrow3, String(longRangeMedianW));
    insertCell(bodyrow3, String(longRangeAvgW.toFixed(2)));

    let text = 'Pool ' + result.values.pool
        + ' | Attack Challenge mod. ' + result.values.attModifier
        + ' | Damage mod. ' + result.values.dmgModifier;
    if (result.values.brutal) {
        text += ' | Brutal (' + result.values.brutal + ')';
    }
    if (result.values.prowess) {
        text += ' | Prowess (' + result.values.prowess + ')';
    }
    if (result.values.strong) {
        text += ' | Strong';
    }
    if (result.values.weak) {
        text += ' | Weak';
    }
    if (result.values.combo) {
        text += ' | Combo Attack';
    }
    if (result.values.tough) {
        text += ' | Tough (' + result.values.tough + ')';
    }

    const caption = table.createCaption();
    caption.innerText = text;

    const container = document.getElementById('ranged-result-container');
    while (container!.firstChild) {
        container!.firstChild.remove();
    }
    container!.appendChild(table);
}

function renderRangedChart(chart: Chart, result: IRangedResult): void {
    /* count the number of occurence of wounds. Example : 
    wounds[0] = 45 -> 45 times 0 wound
    wounds[1] = undefined -> 0 time 1 wound
    wounds[2] = 33 -> 33 times 2 wounds
    etc... */
    const wounds1 = result.short.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);
    const wounds2 = result.medium.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);
    const wounds3 = result.long.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);

    const data1: (number | null)[] = [];
    const data2: (number | null)[] = [];
    const data3: (number | null)[] = [];

    for (let i = 0; i < wounds1.length; i++) {
        const sum = wounds1.slice(i).reduce((p, c) => p + (c || 0), 0);
        data1.push(sum * 100 / result.short.wounds.length);
    }
    for (let i = 0; i < wounds2.length; i++) {
        const sum = wounds2.slice(i).reduce((p, c) => p + (c || 0), 0);
        data2.push(sum * 100 / result.medium.wounds.length);
    }
    for (let i = 0; i < wounds3.length; i++) {
        const sum = wounds3.slice(i).reduce((p, c) => p + (c || 0), 0);
        data3.push(sum * 100 / result.long.wounds.length);
    }

    chart.data.datasets = [
        {
            type: 'line',
            label: 'Short range',
            data: data1,
            spanGaps: true,
        },
        {
            type: 'line',
            label: 'Medium range',
            data: data2,
            spanGaps: true,
        },
        {
            type: 'line',
            label: 'Long range',
            data: data3,
            spanGaps: true,
        }
    ];

    const max = chart.data.datasets.reduce((p, c) => Math.max(p, c.data.length), 0);
    const arr = new Array(max);
    chart.data.labels = arr.fill(undefined).map((_, index) => index);

    chart.update();
}

interface IMeleeResult {
    player1: {
        values: {
            attPool: number,
            defPool: number,
            dmgModifier: number,
            brutal: number,
            attProwess: number,
            defProwess: number,
            feint: number,
            strong: boolean,
            weak: boolean,
            combo: boolean,
            tough: number,
            parry: number,
            dodge: number,
            kata: boolean,
            unblockable: number,
            impDefence: number,
        },
        hits: boolean[],
        wounds: number[],
    },
    player2: {
        values: {
            attPool: number,
            defPool: number,
            dmgModifier: number,
            brutal: number,
            attProwess: number,
            defProwess: number,
            feint: number,
            strong: boolean,
            weak: boolean,
            combo: boolean,
            tough: number,
            parry: number,
            dodge: number,
            kata: boolean,
            unblockable: number,
            impDefence: number,
        },
        hits: boolean[],
        wounds: number[],
    }
}

function renderMeleeTable(result: IMeleeResult): void {
    const table = document.createElement('table');
    table.classList.add('table');

    const head = table.createTHead();

    const headrow1 = head.insertRow();
    insertThCell(headrow1);
    insertThCell(headrow1, 'Hit rate');
    insertThCell(headrow1, 'Median wounds');
    insertThCell(headrow1, 'Average wounds');

    const body = table.createTBody();

    const p1HitRate = getAverage(result.player1.hits.map(x => x ? 100 : 0));
    const p1MedianWounds = getMedian(result.player1.wounds);
    const p1AverageWounds = getAverage(result.player1.wounds);

    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Active player');
    insertCell(bodyrow1, String(p1HitRate.toFixed(2)) + '%');
    insertCell(bodyrow1, String(p1MedianWounds));
    insertCell(bodyrow1, String(p1AverageWounds.toFixed(2)));

    const p2HitRate = getAverage(result.player2.hits.map(x => x ? 100 : 0));
    const p2MedianWounds = getMedian(result.player2.wounds);
    const p2AverageWounds = getAverage(result.player2.wounds);

    const bodyrow2 = body.insertRow();
    insertThCell(bodyrow2, 'Non active player');
    insertCell(bodyrow2, String(p2HitRate.toFixed(2)) + '%');
    insertCell(bodyrow2, String(p2MedianWounds));
    insertCell(bodyrow2, String(p2AverageWounds.toFixed(2)));

    const p1v = result.player1.values;
    let text1 = 'Att. Pool ' + p1v.attPool
        + ' | Def. Pool ' + p1v.defPool
        + ' | Damage mod. ' + p1v.dmgModifier;
    if (p1v.kata) {
        text1 += ' | Kata';
    }
    if (p1v.combo) {
        text1 += ' | Combo Attack';
    }
    if (p1v.attProwess) {
        text1 += ' | Prowess [Attack] (' + p1v.attProwess + ')';
    }
    if (p1v.brutal) {
        text1 += ' | Brutal (' + p1v.brutal + ')';
    }
    if (p1v.feint) {
        text1 += ' | Feint (' + p1v.feint + ')';
    }
    if (p1v.strong) {
        text1 += ' | Strong';
    }
    if (p1v.weak) {
        text1 += ' | Weak';
    }
    if (p1v.unblockable) {
        text1 += ' | Unblockable (' + p1v.unblockable + ')';
    }
    if (p1v.defProwess) {
        text1 += ' | Prowess [Defence] (' + p1v.defProwess + ')';
    }
    if (p1v.parry) {
        text1 += ' | Parry (' + p1v.parry + ')';
    }
    if (p1v.dodge) {
        text1 += ' | Dodge (' + p1v.dodge + ')';
    }
    if (p1v.tough) {
        text1 += ' | Tough (' + p1v.tough + ')';
    }
    if (p1v.impDefence) {
        text1 += ' | Impenetrable Defence (' + p1v.impDefence + ')';
    }

    const p2v = result.player2.values;
    let text2 = 'Att. Pool ' + p2v.attPool
        + ' | Def. Pool ' + p2v.defPool
        + ' | Damage mod. ' + p2v.dmgModifier;
    if (p2v.kata) {
        text2 += ' | Kata';
    }
    if (p2v.combo) {
        text2 += ' | Combo Attack';
    }
    if (p2v.attProwess) {
        text2 += ' | Prowess [Attack] (' + p2v.attProwess + ')';
    }
    if (p2v.brutal) {
        text2 += ' | Brutal (' + p2v.brutal + ')';
    }
    if (p2v.feint) {
        text2 += ' | Feint (' + p2v.feint + ')';
    }
    if (p2v.strong) {
        text2 += ' | Strong';
    }
    if (p2v.weak) {
        text2 += ' | Weak';
    }
    if (p2v.unblockable) {
        text2 += ' | Unblockable (' + p2v.unblockable + ')';
    }
    if (p2v.defProwess) {
        text2 += ' | Prowess [Defence] (' + p2v.defProwess + ')';
    }
    if (p2v.parry) {
        text2 += ' | Parry (' + p2v.parry + ')';
    }
    if (p2v.dodge) {
        text2 += ' | Dodge (' + p2v.dodge + ')';
    }
    if (p2v.tough) {
        text2 += ' | Tough (' + p2v.tough + ')';
    }
    if (p2v.impDefence) {
        text2 += ' | Impenetrable Defence (' + p2v.impDefence + ')';
    }

    const caption = table.createCaption();
    caption.innerHTML = 'Active : ' + text1 + '<br>Non active : ' + text2;

    const container = document.getElementById('melee-result-container');
    while (container!.firstChild) {
        container!.firstChild.remove();
    }
    container!.appendChild(table);
}

function renderMeleeChart(chart: Chart, result: IMeleeResult): void {
    /* count the number of occurence of wounds. Example : 
    wounds[0] = 45 -> 45 times 0 wound
    wounds[1] = undefined -> 0 time 1 wound
    wounds[2] = 33 -> 33 times 2 wounds
    etc... */
    const wounds1 = result.player1.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);
    const wounds2 = result.player2.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);

    const data1: (number | null)[] = [];
    const data2: (number | null)[] = [];

    for (let i = 0; i < wounds1.length; i++) {
        const sum = wounds1.slice(i).reduce((p, c) => p + (c || 0), 0);
        data1.push(sum * 100 / result.player1.wounds.length);
    }
    for (let i = 0; i < wounds2.length; i++) {
        const sum = wounds2.slice(i).reduce((p, c) => p + (c || 0), 0);
        data2.push(sum * 100 / result.player2.wounds.length);
    }

    chart.data.datasets = [
        {
            type: 'line',
            label: 'Active player',
            data: data1,
            spanGaps: true,
        },
        {
            type: 'line',
            label: 'Non active player',
            data: data2,
            spanGaps: true,
        }
    ];

    const max = chart.data.datasets.reduce((p, c) => Math.max(p, c.data.length), 0);
    const arr = new Array(max);
    chart.data.labels = arr.fill(undefined).map((_, index) => index);

    chart.update();
}

const SIM_COUNT = 100000;

function calcRanged(): IRangedResult | undefined {
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

            const result = getTestResult(attDices, false, 0);

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

        return {
            values: {
                pool,
                attModifier,
                dmgModifier,
                brutal,
                prowess,
                strong,
                weak,
                combo,
                tough,
            },
            short: {
                hits: shortRangeHits,
                wounds: shortRangeWounds,
            },
            medium: {
                hits: mediumRangeHits,
                wounds: mediumRangeWounds,
            },
            long: {
                hits: longRangeHits,
                wounds: longRangeWounds,
            }
        };
    }
}

function calcMelee(): IMeleeResult | undefined {
    const form = document.querySelector<HTMLFormElement>('#form-melee');
    const valid = form!.reportValidity();
    if (valid) {
        const inputP1AttPool = document.querySelector<HTMLInputElement>('#melee-p1-att-pool');
        const p1AttPool = Number(inputP1AttPool!.value);
        const inputP2AttPool = document.querySelector<HTMLInputElement>('#melee-p2-att-pool');
        const p2AttPool = Number(inputP2AttPool!.value);

        const inputP1Dodge = document.querySelector<HTMLInputElement>('#melee-p1-dodge');
        const p1Dodge = Number(inputP1Dodge!.value);
        const inputP2Dodge = document.querySelector<HTMLInputElement>('#melee-p2-dodge');
        const p2Dodge = Number(inputP2Dodge!.value);

        const inputP1AttProwess = document.querySelector<HTMLInputElement>('#melee-p1-att-prowess');
        const p1AttProwess = Number(inputP1AttProwess!.value);
        const inputP2AttProwess = document.querySelector<HTMLInputElement>('#melee-p2-att-prowess');
        const p2AttProwess = Number(inputP2AttProwess!.value);

        const selectP1Kata = document.querySelector<HTMLInputElement>('#melee-p1-kata');
        const p1Kata = Boolean(Number(selectP1Kata!.value));
        const selectP2Kata = document.querySelector<HTMLInputElement>('#melee-p2-kata');
        const p2Kata = Boolean(Number(selectP2Kata!.value));

        const inputP1DefProwess = document.querySelector<HTMLInputElement>('#melee-p1-def-prowess');
        const p1DefProwess = Number(inputP1DefProwess!.value);
        const inputP2DefProwess = document.querySelector<HTMLInputElement>('#melee-p2-def-prowess');
        const p2DefProwess = Number(inputP2DefProwess!.value);

        const inputP1Feint = document.querySelector<HTMLInputElement>('#melee-p1-feint');
        const p1Feint = Number(inputP1Feint!.value);
        const inputP2Feint = document.querySelector<HTMLInputElement>('#melee-p2-feint');
        const p2Feint = Number(inputP2Feint!.value);

        const inputP1Brutal = document.querySelector<HTMLInputElement>('#melee-p1-brutal');
        const p1Brutal = Number(inputP1Brutal!.value);
        const inputP2Brutal = document.querySelector<HTMLInputElement>('#melee-p2-brutal');
        const p2Brutal = Number(inputP2Brutal!.value);

        const inputP1Parry = document.querySelector<HTMLInputElement>('#melee-p1-parry');
        const p1Parry = Number(inputP1Parry!.value);
        const inputP2Parry = document.querySelector<HTMLInputElement>('#melee-p2-parry');
        const p2Parry = Number(inputP2Parry!.value);

        const inputP1DefPool = document.querySelector<HTMLInputElement>('#melee-p1-def-pool');
        const p1DefPool = Number(inputP1DefPool!.value);
        const inputP2DefPool = document.querySelector<HTMLInputElement>('#melee-p2-def-pool');
        const p2DefPool = Number(inputP2DefPool!.value);

        const selectP1Combo = document.querySelector<HTMLSelectElement>('#melee-p1-combo');
        const p1Combo = Boolean(Number(selectP1Combo!.value));
        const selectP2Combo = document.querySelector<HTMLSelectElement>('#melee-p2-combo');
        const p2Combo = Boolean(Number(selectP2Combo!.value));

        const selectP1StrongWeak = document.querySelector<HTMLSelectElement>('#melee-p1-strong-weak');
        const p1Strong = Number(selectP1StrongWeak!.value) === 1;
        const p1Weak = Number(selectP1StrongWeak!.value) === 2;
        const selectP2StrongWeak = document.querySelector<HTMLSelectElement>('#melee-p2-strong-weak');
        const p2Strong = Number(selectP2StrongWeak!.value) === 1;
        const p2Weak = Number(selectP2StrongWeak!.value) === 2;

        const inputP1DmgModifier = document.querySelector<HTMLInputElement>('#melee-p1-dmg-modifier');
        const p1DmgModifier = Number(inputP1DmgModifier!.value);
        const inputP2DmgModifier = document.querySelector<HTMLInputElement>('#melee-p2-dmg-modifier');
        const p2DmgModifier = Number(inputP2DmgModifier!.value);

        const inputP1Tough = document.querySelector<HTMLInputElement>('#melee-p1-tough');
        const p1Tough = Number(inputP1Tough!.value);
        const inputP2Tough = document.querySelector<HTMLInputElement>('#melee-p2-tough');
        const p2Tough = Number(inputP2Tough!.value);

        const inputP1Unblock = document.querySelector<HTMLInputElement>('#melee-p1-unblock');
        const p1Unblock = Number(inputP1Unblock!.value);
        const inputP2Unblock = document.querySelector<HTMLInputElement>('#melee-p2-unblock');
        const p2Unblock = Number(inputP2Unblock!.value);

        const inputP1ImpDef = document.querySelector<HTMLInputElement>('#melee-p1-impdef');
        const p1ImpDef = Number(inputP1ImpDef!.value);
        const inputP2ImpDef = document.querySelector<HTMLInputElement>('#melee-p2-impdef');
        const p2ImpDef = Number(inputP2ImpDef!.value);

        const p1Hits: boolean[] = [];
        const p1Wounds: number[] = [];
        const p2Hits: boolean[] = [];
        const p2Wounds: number[] = [];

        for (let x = 0; x < SIM_COUNT; x++) {
            const p1AttDices: number[] = [];
            for (let i = 0; i < p1AttPool; i++) {
                const dice = d6();
                p1AttDices.push(dice);
            }
            const p2AttDices: number[] = [];
            for (let i = 0; i < p2AttPool; i++) {
                const dice = d6();
                p2AttDices.push(dice);
            }

            if (p2Dodge) {
                rerollDodgeFeint(p1AttDices, p2Dodge);
            }
            if (p1AttProwess) {
                rerollProwess(p1AttDices, p1AttProwess);
            }

            if (p2AttProwess) {
                rerollProwess(p2AttDices, p2AttProwess);
            }
            if (p1Dodge) {
                rerollDodgeFeint(p2AttDices, p1Dodge);
            }

            const p1AttResult = getTestResult(p1AttDices, p1Kata, p2ImpDef);
            const p2AttResult = getTestResult(p2AttDices, p2Kata, p1ImpDef);

            let p1Hit = false;
            let p1Wound = 0;
            let p2Hit = false;
            let p2Wound = 0;

            if (p1AttResult !== -1) {
                const p2DefDices: number[] = [];
                for (let i = 0; i < p2DefPool; i++) {
                    const dice = d6();
                    p2DefDices.push(dice);
                }

                if (p2DefProwess) {
                    rerollProwess(p2DefDices, p2DefProwess);
                }
                if (p1Feint) {
                    rerollDodgeFeint(p2DefDices, p1Feint);
                }

                const p2DefResult = getTestResult(p2DefDices, p2Kata, p1Unblock);

                const res1 = p1AttResult + p1Brutal;
                let sl1 = p2DefResult === -1 ? res1 : res1 - (p2DefResult + p2Parry);
                if (sl1 === 0) {
                    if (p1AttDices.length < p2DefDices.length) {
                        sl1 = -1;
                    }
                }

                const p1SLs = getSucessLevels(sl1, p1Combo);

                p1Hit = p1SLs.length ? true : false;

                for (let i = 0; i < p1SLs.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices: number[] = [dice1, dice2];

                    if (p1Strong) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => b - a);
                    }
                    else if (p1Weak) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => a - b);
                    }

                    const dmgRoll = dmgDices.slice(0, 2).reduce((a, b) => a + b);
                    const dmgRollMod = dmgRoll + p1DmgModifier;

                    const sl = p1SLs[i];
                    p1Wound += getWounds(dmgRollMod, sl, p2Tough);
                }
            }
            if (p2AttResult !== -1) {
                const p1DefDices: number[] = [];
                for (let i = 0; i < p1DefPool; i++) {
                    const dice = d6();
                    p1DefDices.push(dice);
                }

                if (p2Feint) {
                    rerollDodgeFeint(p1DefDices, p2Feint);
                }
                if (p1DefProwess) {
                    rerollProwess(p1DefDices, p1DefProwess);
                }

                const p1DefResult = getTestResult(p1DefDices, p1Kata, p2Unblock);

                const res2 = p2AttResult + p2Brutal;
                let sl2 = p1DefResult === -1 ? res2 : res2 - (p1DefResult + p1Parry);
                if (sl2 === 0) {
                    if (p2AttDices.length < p1DefDices.length) {
                        sl2 = -1;
                    }
                }

                const p2SLs = getSucessLevels(sl2, p2Combo);

                p2Hit = p2SLs.length ? true : false;

                for (let i = 0; i < p2SLs.length; i++) {
                    const dice1 = d6();
                    const dice2 = d6();
                    const dmgDices: number[] = [dice1, dice2];

                    if (p2Strong) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => b - a);
                    }
                    else if (p2Weak) {
                        const dice3 = d6();
                        dmgDices.push(dice3);
                        dmgDices.sort((a, b) => a - b);
                    }

                    const dmgRoll = dmgDices.slice(0, 2).reduce((a, b) => a + b);
                    const dmgRollMod = dmgRoll + p2DmgModifier;

                    const sl = p2SLs[i];
                    p2Wound += getWounds(dmgRollMod, sl, p1Tough);
                }
            }

            p1Hits.push(p1Hit);
            p1Wounds.push(p1Wound);
            p2Hits.push(p2Hit);
            p2Wounds.push(p2Wound);
        }

        return {
            player1: {
                values: {
                    attPool: p1AttPool,
                    defPool: p1DefPool,
                    dmgModifier: p1DmgModifier,
                    brutal: p1Brutal,
                    attProwess: p1AttProwess,
                    defProwess: p1DefProwess,
                    feint: p1Feint,
                    strong: p1Strong,
                    weak: p1Weak,
                    combo: p1Combo,
                    tough: p1Tough,
                    parry: p1Parry,
                    dodge: p1Dodge,
                    kata: p1Kata,
                    unblockable: p1Unblock,
                    impDefence: p1ImpDef,
                },
                hits: p1Hits,
                wounds: p1Wounds
            },
            player2: {
                values: {
                    attPool: p2AttPool,
                    defPool: p2DefPool,
                    dmgModifier: p2DmgModifier,
                    brutal: p2Brutal,
                    attProwess: p2AttProwess,
                    defProwess: p2DefProwess,
                    feint: p2Feint,
                    strong: p2Strong,
                    weak: p2Weak,
                    combo: p2Combo,
                    tough: p2Tough,
                    parry: p2Parry,
                    dodge: p2Dodge,
                    kata: p2Kata,
                    unblockable: p2Unblock,
                    impDefence: p2ImpDef,
                },
                hits: p2Hits,
                wounds: p2Wounds
            }
        };
    }
}

const chartConfig = {
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Minimum wounds'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: any) => value + '%'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: (items: any) => {
                        const w = Number(items[0].label);
                        if (w > 1) {
                            return 'Probability of inflicting at least ' + w + ' wounds'
                        }
                        return 'Probability of inflicting at least ' + w + ' wound'
                    },
                    label: (item: any) => item.dataset.label + ' : ' + Number(item.raw).toFixed(2) + '%'
                }
            }
        }
    },
    data: {
        datasets: []
    },
};

const canvas1 = document.querySelector<HTMLCanvasElement>('#ranged-chart-container');
const ctx1 = canvas1!.getContext('2d');
const chartRanged = new Chart(ctx1!, chartConfig);

const canvas2 = document.querySelector<HTMLCanvasElement>('#melee-chart-container');
const ctx2 = canvas2!.getContext('2d');
const chartMelee = new Chart(ctx2!, chartConfig);

const btnCalcRanged = document.getElementById('btn-ranged-calc');
btnCalcRanged!.addEventListener('click', () => {
    const result = calcRanged();
    if (result) {
        renderRangedTable(result);
        canvas1!.classList.remove('d-none');
        renderRangedChart(chartRanged, result);
    }
});

const btnCalcMelee = document.getElementById('btn-melee-calc');
btnCalcMelee!.addEventListener('click', () => {
    const result = calcMelee();
    if (result) {
        renderMeleeTable(result);
        canvas2!.classList.remove('d-none');
        renderMeleeChart(chartMelee, result);
    }
});
