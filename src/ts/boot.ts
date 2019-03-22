//xxx/<amd-module name="js/src/ts/boot.js"/>
/// <amd-dependency path="js/src/ts/index.js" name="index"/>



console.log('boot start')
// import {indexValue} from './index.js'
var indexValue = require('index')
console.log('got', indexValue)

console.log('/boot')
