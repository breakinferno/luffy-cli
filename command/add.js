'use strict'
const config = require('../templates')
const chalk = require('chalk')
const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')

const typechoose = (type) => {
    return function(answers) {
        const flag = answers.type === type;
        return flag;
    }
}

const questions = [
    {
        type: 'input',
        name: 'tplName',
        message: "What's your template name?",
        validate: function(value) {
            console.log('\nvalidate ' + value);
            // 检验重复，名字合法性
            if (!config.tpl[value]) {
                config.tpl[value] = {};
                return true;
            } else {
                console.log(chalk.red('Template has exsited!'));
                return 'Please reinput!'
            }
        }
    }, {
        type: 'rawlist',
        name: 'type',
        message: "Where does the tpl locate?",
        choices: ['github', 'local'],
        default: 'github',
    }, {
        type: 'input',
        name: 'address',
        message: 'Input the filepath your template located!',
        when: typechoose('local')
    }, {
        type: 'input',
        name: 'address',
        message: "Input the github address where the template located.",
        when: typechoose('github')
    },  {
        type: 'input',
        name: 'branch',
        message: "What's the branch you will choose?",
        when: typechoose('github')
    }
]

module.exports = () => {
    inquirer.prompt(questions)
    .then(answers => {
        // 写入模板信息，并且处理
        if (answers.type === 'github') {
            config.tpl[answers['tplName']]['url'] = answers.address.replace(/[\u0000-\u0019]/g, '');
            config.tpl[answers['tplName']]['branch'] = answers.branch || 'master';
        }
        // 默认类型为github地址
        config.tpl[answers['tplName']]['type'] = answers.type || 'github';
        fs.writeFile(path.join(__dirname, '../templates.json'), JSON.stringify(config), 'utf-8', err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(chalk.green('New Template has added!\n'));
            console.log(chalk.grey('The last template list is: \n'));
            console.log(config);
            console.log('\n');
            process.exit();
        })

    })
}