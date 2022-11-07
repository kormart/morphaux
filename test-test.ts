import * as process from 'process'

const args = process.argv.slice(2)

console.log('Morphaux, run test with arguments: ', args);

const upOrDown = args[0]
if( !(upOrDown == 'up' || upOrDown == 'dn')) {
    console.log("Command must be either  up or dn")
    process.exit()
}

console.log('here');
