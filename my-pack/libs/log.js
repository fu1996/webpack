const chalk = require("chalk");
const printConfig = msg => console.log(chalk.greenBright(msg));
const printCore = msg => console.log(chalk.redBright(msg));

exports.printConfig = printConfig;
exports.printCore = printCore;
