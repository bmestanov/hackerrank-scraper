# Hackerrank contest scraper
Given a contest slug and browser cookie, fetches all eligible submissions and keeps track of scores in a json file.

## Requirements:
* node 8
* npm

## How to run:
1. `npm install`
2. Check your hackerrank cookie header and paste it into the file "cookie"

__Note: Make sure the file is a single line__

3. `CONTEST=<contest-slug> npm start`

## Command line options
### Main script
Downloads all submissions code & results in json format

Environment
* `CONTEST` - contest slug
* `PARTS` - fetches submissions in multiple iterations

Example
```bash
CONTEST=my-contest PARTS=2 npm start
```

# json-to-csv
After downloading contest info, you can transform the results json to a simple csv format.

Environment
* `CONTEST` - contest slug

Example
```bash
CONTEST=si-practice-2 node json-to-csv.js
```