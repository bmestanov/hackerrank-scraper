const fs = require('fs');
const path = require('path');
const promise = require('request-promise');
const { get, set } = require('lodash/object');
const lib = require('./lib');

const cookieContent = fs.readFileSync('cookie', 'utf8');
const contestName = process.env.CONTEST || 'practice-1-si';
const contestPath = path.join('files', contestName);

const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

if (!fs.existsSync(contestPath)) {
    fs.mkdirSync(contestPath);
}

function updateSubmissionScore(student, challengeSlug, score) {
    const existingScore = get(results, [student, contestName, challengeSlug]);
    const maxScore = existingScore ? Math.max(existingScore, score) : score;
    set(results, [student, contestName, challengeSlug], maxScore);
}

async function processSubmission(submissionId) {
    const response = await promise.get({
        url: lib.singleSubmissionsUrl(contestName, submissionId),
        headers: {
            cookie: cookieContent,
        },
        json: true,
    });

    const submission = response.model;
    const student = submission.hacker_username.toLowerCase();
    const studentFolder = path.join(contestPath, student);

    if (!fs.existsSync(studentFolder)) {
        fs.mkdirSync(studentFolder);
    }

    const submissionFile = path.join(studentFolder, `${submission.challenge_slug}-${submissionId}.cpp`);
    fs.writeFileSync(submissionFile, submission.code);
    updateSubmissionScore(student, submission.challenge_slug, submission.display_score);
}

async function main() {
    console.log("Checking submissions count for contest %s", contestName);
    const count = await promise.get({
        url: lib.listSubmissionsUrl(contestName),
        headers: {
            cookie: cookieContent,
        },
        json: true
    });

    console.log("%d submissions were made", count.total);
    console.log("Fetching submissions list");
    const response = await promise.get({
        url: lib.listSubmissionsUrl(contestName),
        qs: {
            offset: 0,
            limit: count.total,
            ' ': Date.now(),
        },
        headers: {
            cookie: cookieContent,
        },
        json: true,
    });

    console.log("%d submissions were fetched", response.models.length);
    const eligible = response.models.filter((submission) => {
        return ['cpp', 'cpp14'].includes(submission.language) &&
            submission.in_contest_bounds &&
            submission.kind === 'code' &&
            submission.score > 0;
    })
        .map(submission => submission.id)

    console.log("Processing %d eligible submissions", eligible.length);
    await Promise.all(eligible.map(processSubmission));
    console.log("Done");
    fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
};

(async () => {
    try {
        await main();
    } catch (err) {
        console.error("An error occured: %d", err.statusCode);
    }
})();