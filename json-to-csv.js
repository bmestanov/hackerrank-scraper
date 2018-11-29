const fs = require('fs');
const path = require('path');
const get = require('lodash/get');

const contestName = process.env.CONTEST || 'practice-1-si';
const inputPath = path.join('results', contestName + '.json');
const outputPath = path.join('results', contestName + '.csv');

const results = JSON.parse(fs.readFileSync(inputPath));
const hackerKeys = Object.keys(results);
let tasks = new Set();

hackerKeys.forEach(hacker => {
    Object.keys(results[hacker]).forEach(task => tasks.add(task));
});

// Convert to array
tasks = [...tasks];

const outFile = fs.createWriteStream(outputPath);
outFile.write(['hacker', ...tasks, 'total', '\n'].join(','));

hackerKeys.forEach(hacker => {
    const hackerResults = tasks
        .map(t => get(results, [hacker, t, 'score'], 0))
        .map(x => +x.toFixed(2));
    const total = hackerResults.reduce((acc, curr) => acc + curr).toFixed(2);
    outFile.write([hacker, ...hackerResults, +total, '\n'].join(','));
});

outFile.end();

console.log("Found tasks", tasks);
