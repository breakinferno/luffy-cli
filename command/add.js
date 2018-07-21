'use strict'
const config = require('../templates.json')
const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs-extra');
const treeify = require('treeify')

const options = /node_modules/; // 添加库的限制条件，可以用于避免node_modules等文件

const typechoose = (type) => {
    return function (answers) {
        const flag = answers.type === type;
        return flag;
    }
}



const questions = [{
    type: 'input',
    name: 'tplName',
    message: "What's your template name?",
    validate: function (value) {
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
    name: 'filter',
    message: 'Input some filter with Regx, and use " " to add more!',
    when: typechoose('local')
}, {
    type: 'input',
    name: 'address',
    message: "Input the github address where the template located.",
    when: typechoose('github')
}, {
    type: 'input',
    name: 'branch',
    message: "What's the branch you will choose?",
    when: typechoose('github')
}]

const filter = situation => file => {
    if (!!!situation) {
        return true
    }
    const arrs = situation.split(' ');
    let flag = arrs.some(arr => {
        return new RegExp(arr).test(file)
    })
    return !flag;
}

module.exports = (options) => {
    inquirer.prompt(questions)
        .then(answers => {
            // 写入模板信息，并且处理
            if (answers.type === 'github') {
                config.tpl[answers['tplName']]['url'] = answers.address.replace(/[\u0000-\u0019]/g, '');
                config.tpl[answers['tplName']]['branch'] = answers.branch || 'master';
                return {
                    config,
                    answers
                };
            } else {
                const templatePath = path.join(__dirname, '../templates', answers['tplName']);
                // 支持相对路径 多参数join
                return new Promise((resolve, reject) => {
                    fs.copy(answers.address, templatePath, filter(answers.filter), err => {
                        console.log('copy over!');
                        if (err) {
                            reject(err)
                        }
                        config.tpl[answers.tplName]['url'] = templatePath;
                        resolve({
                            config,
                            answers
                        })
                    })
                })
            }
        }).then(({
            answers,
            config
        }) => {
            // 默认类型为github地址
            config.tpl[answers['tplName']]['type'] = answers.type || 'github';
            fs.writeFile(path.join(__dirname, '../templates.json'), JSON.stringify(config), 'utf-8', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(chalk.green('New Template has added!\n'));
                console.log(chalk.grey('The last template list is: \n'));
                console.log(chalk.blue(treeify.asTree(config.tpl, true)));
            })
        })
        .catch(err => {
            console.log(chalk.red(err));
        })
}