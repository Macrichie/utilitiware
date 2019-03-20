const largeNum = require('./script2');
const fs = require('fs');

fs.readFile('./test.txt', (err, data) => {
    console.time('funchallenge');
    if(err) {
        console.error('Ooop! Something went wrong.')
    }
    console.log('Async: ', data.toString('utf8')+JSON.stringify(largeNum));
    console.timeEnd('funchallenge');
});

const file = fs.readFileSync('./test.txt');
console.log('Sync: ', file.toString());

// APPEND
// fs.appendFile('./test.txt', ' This is so cool', err => {
//     if(err) {
//         console.log(err);
//     }
// });

// WRITE
// fs.writeFile('./bye.txt', 'So Sad to see you go', err => {
//     if(err) {
//         console.log(err);
//     }
// });

// DELETE
// fs.unlink('./bye.txt', err => {
//     if(err) {
//         console.log(err);
//     }
//     console.log('Deleted!')
// });


