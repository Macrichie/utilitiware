const fs = require('fs');

// 1 - What floor does santa end up on
// ( --> santa should go UP 1 floor
// ) --> santa should go DOWN 1 floor
function santasMove() {
    
    fs.readFile('./santa/santa.txt', (err, data) => {
        console.time('santa time');
        if(err) {
            console.log('Oopps something went wrong!')
        }
        const direction = data.toString();
        //get each direction in an array
        const directionsArray = direction.split('');
        const getFloor = directionsArray.reduce((acc, curr) => {
            if(curr === '(') {
                return acc += 1;
            } else {
                return acc -= 1
            }
        }, 0);
        console.timeEnd('santa time');
        console.log('Floor: ', getFloor);
    });
}

santasMove();

function santasMove2() {
    
    fs.readFile('./santa/santa.txt', (err, data) => {
        console.time('santa time');
        if(err) {
            console.log('Oopps something went wrong!')
        }
        const direction = data.toString();
        //get each direction in an array
        const directionsArray = direction.split('');
        let counter = 0;
        let acc = 0;
        const getFloor = directionsArray.some((currentItem) => {
            if(currentItem === '(') {
                acc += 1;
            } else {
                acc -= 1;
            }
            counter++;
            return acc < 0;

        });
        console.timeEnd('santa time');
        console.log('First Basement: ', counter);
    });
}

santasMove2();
