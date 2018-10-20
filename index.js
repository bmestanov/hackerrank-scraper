const fs = require('fs');
const path = require('path');
const promise = require('request-promise');
const { get, set } = require('lodash/object');
const lib = require('./lib');
const sort = require('sort-keys');

const cookieContent = fs.readFileSync('cookie', 'utf8');
const contestName = process.env.CONTEST || 'practice-1-si';

const contestPath = path.join('files', contestName);
const resultsPath = path.join('results', contestName + '.json');

const fileExtensions = {
    cpp: 'cpp',
    cpp14: 'cpp',
    csharp: 'cs',
    java: 'java',
    java8: 'java',
    javascript: 'js',
    python: 'py'
};

if (!fs.existsSync(contestPath)) {
    fs.mkdirSync(contestPath);
}

const results = {};

function updateSubmissionScore(student, submission) {
    const existingScore = get(results, [student, submission.challenge_slug, 'score']);
    const maxScore = existingScore ? Math.max(existingScore, submission.display_score) : submission.display_score;
    set(results, [student, submission.challenge_slug, 'score'], maxScore);
    set(results, [student, submission.challenge_slug, 'submissions', `submission-${submission.id}`], {
        language: submission.language,
        status: submission.status,
        score: submission.display_score,
        created_at: submission.created_at_epoch
    });
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
    let student;

    student = submission.hacker_username;
    if (!student) {
        console.error("Submission %d does not have a hacker username", submissionId);
        return;
    }

    const studentFolder = path.join(contestPath, student);

    if (!fs.existsSync(studentFolder)) {
        fs.mkdirSync(studentFolder);
    }

    // Save submission code
    const submissionFile = path.join(studentFolder,
        `${submission.challenge_slug}-${submissionId}.${fileExtensions[submission.language]}`);
    fs.writeFileSync(submissionFile, submission.code);

    // Update results object
    updateSubmissionScore(student, submission);
}

async function getSubmissionCount() {
    console.log("Checking submissions count for contest %s", contestName);
    const count = await promise.get({
        url: lib.listSubmissionsUrl(contestName),
        qs: {
            limit: 0
        },
        headers: {
            cookie: cookieContent,
        },
        json: true
    });

    console.log("%d submissions were made", count.total);
    return count.total;
}

async function main(offset, limit) {
    console.log(`Fetching submissions [${offset} - ${offset + limit}]`);
    const response = await promise.get({
        url: lib.listSubmissionsUrl(contestName),
        qs: {
            offset,
            limit,
            ' ': Date.now(),
        },
        headers: {
            cookie: cookieContent,
        },
        json: true,
    });

    console.log("%d submissions were fetched", response.models.length);
    const eligible = response.models.filter((submission) => {
        return Object.keys(fileExtensions).includes(submission.language) &&
            submission.in_contest_bounds &&
            submission.kind === 'code'
    })
        .map(submission => submission.id)

    console.log("Processing %d eligible submissions", eligible.length);
    await Promise.all(eligible.map(processSubmission));
    console.log("Done");
};

(async () => {
    try {
        const submissions = await getSubmissionCount();
        let offset = 0;
        let limit = submissions;
        const parts = process.env.PARTS;
        if (parts) {
            limit = parseInt(submissions / parts) + 1;
            while (offset < submissions) {
                await main(offset, limit);
                offset += limit;
            }
        } else {
            await main(0, submissions);
        }

        fs.writeFileSync(resultsPath, JSON.stringify(sort(results, { deep: true }), null, 2));
    } catch (err) {
        console.error("An error occured: %d", err.statusCode);
        console.error(err);
    }
})();