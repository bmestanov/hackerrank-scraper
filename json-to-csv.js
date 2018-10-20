const fs = require('fs');
const path = require('path');
const get = require('lodash/get');

// CONTEST=si-practice-2 TASKS=task-1-1-1,task-2-1-2,task-3-1-2,task-4-1-2

const contestName = process.env.CONTEST || 'practice-1-si';

const tasks = process.env.TASKS.split(',');

const inputPath = path.join('results', contestName + '.json');

const outputPath = path.join('results', contestName + '.csv');

const results = JSON.parse(fs.readFileSync(inputPath));

const outFile = fs.createWriteStream(outputPath);

outFile.write(['hacker', ...tasks, 'total', '\n'].join(','));

Object.keys(results).forEach(hacker => {
    const hackerResults = tasks
        .map(t => get(results, [hacker, t, 'score'], 0))
        .map(x => +(x / 25).toFixed(2));
    const total = hackerResults.reduce((acc, curr) => acc + curr).toFixed(2);
    outFile.write([hacker, ...hackerResults, +total, '\n'].join(','));
});

outFile.end();