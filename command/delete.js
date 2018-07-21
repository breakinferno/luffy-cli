'use strict'
const config = require('../templates.json')
const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs-extra');
const treeify = require('treeify')
const base = require('./base')

const questions = [{
    type: 'checkbox',
    name: 'tplName',
    message: "Choose the template name you want to delete!",
    choices: Object.keys(config.tpl),
    validate: function (answer) {
        if (answer.length < 1) {
            return 'You must choose at least one topping.';
        }
        return true;
    }
}]



module.exports = (options) => {
    inquirer.prompt(questions)
        .then(answers => {
            base.deleteFiles(config, answers.tplName)
            .then(() => {
                fs.writeFile(path.join(__dirname, '../templates.json'), JSON.stringify(config), 'utf-8', err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log(chalk.green(`The template ${answers.tplName} has been deleted!!\n`));
                    console.log(chalk.grey('Now the templates are as below: \n'));
                    console.log(chalk.blue(treeify.asTree(config.tpl, true)));
                })
            })
        })
}