# Hackerrank contest scraper
Given a contest slug and browser cookie, fetches all eligible submissions and keeps track of scores in a json file.

## Requirements:
* node 8
* npm

## How to run:
1. `npm install`
2. Check your hackerrank cookie header and paste it into the file "cookie" 
__Note: Make sure the file is a single line__
4. `CONTEST=<contest-slug> npm start`

## Command line options
* `CONTEST` - contest slug
* `DETAIL` - if enabled:
    1. Fetchess ALL submissions, even the ones that have 0 score
    2. Prints all info about the submission: language, score, created_at, status
* `PARTS` - fetches submissions in multiple iterations

Example
```bash
CONTEST=my-contest DETAIL=1 PARTS=2 npm start
```