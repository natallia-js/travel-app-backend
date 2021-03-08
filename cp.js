const shell = require('shelljs');

const args = process.argv.slice(2);
const src = args[0];
const dest = args[1];

// Check src path has been provided and is valid
if (!src || !shell.test('-d', src)) {
  console.log('\x1b[31m\x1b[40mERR!\x1b[0m src path cannot be found: %s', src);
  process.exit(1);
}

// Check dest path has been provided.
if (!dest) {
  console.log('\x1b[31m\x1b[40mERR!\x1b[0m dest path must be provided:');
  process.exit(1);
}

// Make dest directory if necessary.
shell.mkdir('-p', dest);

// Copy the file.
shell.cp('-R', src, dest);
