'use strict'
const chalk = require('chalk')
const config = require('../templates.json')
const inquirer = require('inquirer')
const path = require('path')
const base = require('./base')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const questions = [{
    type: 'checkbox',
    name: 'tplName',
    message: "What template you want to choose?",
    choices: Object.keys(config.tpl),
    validate: function (answer) {
        if (answer.length < 1) {
            return 'You must choose at least one topping.';
        }
        return true;
    }
}, {
    type: 'input',
    name: 'branchName',
    message: "what's branch you will choose?",
    when: function (answers) {
        // 当只有github才判断是否选择分支
        const tpl = config.tpl[answers.tplName];
        const type = tpl.type || 'github';
        return type === 'github'
    }
}, {
    type: 'input',
    name: 'projectName',
    message: 'Please input the project name!Default name is the template name',
    validate: function (value) {
        if (value) {
            return true
        }
        return false
    }
}];

async function cmdExec(cmd) {
    console.log(chalk.green('Begin to exec the script: ' + cmd))
    const {
        stdout,
        stderr
    } = await exec(cmd);
    if (stderr) {
        throw new Error(stderr);
    }
    return stdout;
}

const handleFileError = (fileName) => {
    console.log(path.join(process.cwd(), fileName));
    return base.deleteFolder(path.join(process.cwd(), fileName));
}

module.exports = () => {
    inquirer.prompt(questions)
        .then((answers) => {
            const {
                tplName,
                branchName,
            } = answers;
            console.log(chalk.green('Start generate!'))
            let projectName = answers.projectName || tplName;
            const tpl = config.tpl[tplName];
            const {
                url,
                type
            } = tpl;
            const distUrl = process.cwd();
            if (type === 'local') {
                console.log(chalk.green(`Begin clone the responsity from the ${url}!`));
                // 本地克隆即可
                return base.copyFiles(url, distUrl, null, null)
                .catch(err => {
                    console.log(chalk.red('Copy file failed!'))
                    handleFileError(projectName);
                })
            } else {
                const cmdStr = `git clone ${url} ${projectName} && cd ${projectName} && git checkout ${branchName?branchName:'master'}`
                // 判断是否存在该文件夹
                return base.isExistFolder(distUrl, projectName)
                    .then(() => {
                        console.log(chalk.blue('Exist the dist folder!\n Remove it!\n'))
                        return handleFileError(projectName)
                    })
                    .then(() => {
                        console.log(chalk.green(`Begin clone the responsity from the ${url}!`));
                        return cmdExec(cmdStr);
                    }).catch(err => {
                        console.log(chalk.red(err))
                    })
            }
        })
        .then(() => {
            console.log(chalk.green('Lucky! You init your project successful!\n'));
            // 其他逻辑
        })
        .catch(err => {
            console.log(chalk.red('Wow, something wrong!\n'));
            console.log(chalk.red('Error is ' + err))
        })
}
