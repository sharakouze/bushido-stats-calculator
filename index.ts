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

function getTestResult(dices: number[], kata: boolean): number {
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

function getStandardDeviation(arr: number[]): number {
    if (arr.length == 0) {
        return NaN;
    }
    const n = arr.length
    const mean = arr.reduce((a, b) => a + b) / n
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
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
        attKata: boolean,
        combo: boolean,
        tough: number,
        parry: number,
        dodge: number,
        defKata: boolean,
    },
    hits: boolean[],
    wounds: number[],
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

    const hitRate = getAverage(result.hits.map(x => x ? 100 : 0));
    const medianWounds = getMedian(result.wounds);
    const averageWounds = getAverage(result.wounds);

    const bodyrow1 = body.insertRow();
    insertThCell(bodyrow1, 'Melee');
    insertCell(bodyrow1, String(hitRate.toFixed(2)) + '%');
    insertCell(bodyrow1, String(medianWounds));
    insertCell(bodyrow1, String(averageWounds.toFixed(2)));

    let text = 'Att. Pool ' + result.values.attPool
        + ' | Def. Pool ' + result.values.defPool
        + ' | Damage mod. ' + result.values.dmgModifier;
    if (result.values.brutal) {
        text += ' | Brutal (' + result.values.brutal + ')';
    }
    if (result.values.attProwess) {
        text += ' | Prowess [Attack] (' + result.values.attProwess + ')';
    }
    if (result.values.defProwess) {
        text += ' | Prowess [Defence] (' + result.values.defProwess + ')';
    }
    if (result.values.feint) {
        text += ' | Feint (' + result.values.feint + ')';
    }
    if (result.values.strong) {
        text += ' | Strong';
    }
    if (result.values.weak) {
        text += ' | Weak';
    }
    if (result.values.attKata) {
        text += ' | Kata (Attacker)';
    }
    if (result.values.combo) {
        text += ' | Combo Attack';
    }
    if (result.values.tough) {
        text += ' | Tough (' + result.values.tough + ')';
    }
    if (result.values.parry) {
        text += ' | Parry (' + result.values.parry + ')';
    }
    if (result.values.dodge) {
        text += ' | Dodge (' + result.values.dodge + ')';
    }
    if (result.values.defKata) {
        text += ' | Kata (Defender)';
    }

    const caption = table.createCaption();
    caption.innerText = text;

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
    const wounds1 = result.wounds.reduce<number[]>((p, c) => {
        const d = p[c] || 0;
        p[c] = d + 1;
        return p;
    }, []);

    const data1: (number | null)[] = [];

    for (let i = 0; i < wounds1.length; i++) {
        const sum = wounds1.slice(i).reduce((p, c) => p + (c || 0), 0);
        data1.push(sum * 100 / result.wounds.length);
    }

    chart.data.datasets = [
        {
            type: 'line',
            label: 'Attacker',
            data: data1,
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

        return {
            values: {
                attPool,
                defPool,
                dmgModifier,
                brutal,
                attProwess,
                defProwess,
                feint,
                strong,
                weak,
                attKata,
                combo,
                tough,
                parry,
                dodge,
                defKata,
            },
            hits,
            wounds
        }
    }
}

const chartConfig = {
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Minimum wounds probability'
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
    renderRangedTable(result!);
    canvas1!.classList.remove('d-none');
    renderRangedChart(chartRanged, result!);
});

const btnCalcMelee = document.getElementById('btn-melee-calc');
btnCalcMelee!.addEventListener('click', () => {
    const result = calcMelee();
    renderMeleeTable(result!);
    canvas2!.classList.remove('d-none');
    renderMeleeChart(chartMelee, result!);
});
