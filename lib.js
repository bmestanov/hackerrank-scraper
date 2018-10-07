module.exports = {
    listSubmissionsUrl: (contestName) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/judge_submissions`
    },
    singleSubmissionsUrl: (contestName, submissionId) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/submissions/${submissionId}`
    }
};
