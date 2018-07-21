'use strict'
const config = require('../templates.json')
const treeify = require('treeify')
const chalk = require('chalk');
module.exports = () => {
    console.log(chalk.green(treeify.asTree(config.tpl, true)));
    process.exit();
}