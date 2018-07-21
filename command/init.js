'use strict'
const exec = require('child_process').exec
const chalk = require('chalk')
const config = require('../templates.json')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs-extra');
const treeify = require('treeify')

const questions = [{
    type: 'input',
    name: 'tplName',
    message: "What template you want to choose?",
    validate: function (value) {
        // 检验重复，名字合法性
        if (!config.tpl[value]) {
            console.log(chalk.red('Template not exists.\n You can use "luffy list" or "luffy l" to list all of the template you can use!'));
            return 'Please reinput!'
        } 
        return true
    }
}, {
    type: 'input',
    name: 'branch',
    message: "what's branch you will choose?",
    when: function(answers) {
        // 当只有github才判断是否选择分支
        const tpl = config.tpl[answers.tplName];
        const type = tpl.type
        return type === 'github'
    }
}, {
    type: 'input',
    name: 'projectName',
    message: 'Please input the project name!',
    validate: function(value) {
        if (value) {
            return true
        }
        return false
    }
}];

module.exports = () => {
    inquirer(questions)
    .then(answers => {
        const tpl = config.tpl[answers.tplName];
        const url = tpl.url;
        const branch = tpl.branch || 'master';
        // const cmdStr = `git clone ${gitUrl} ${projectName} && cd ${projectName} && git checkout ${branch}`
    })
}
