'use strict'
const chalk = require('chalk')
const config = require('../templates.json')
const inquirer = require('inquirer')
const path = require('path')
const base = require('./base')
const exec = require('child-process-promise').exec;

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

function cmdExec(cmd) {
    console.log(chalk.green('Begin to exec the script: ' + cmd + '\n'))
    return exec(cmd)
        .then((result) => {
            const {
                stderr,
                stdout
            } = result;
            if (stderr) {
                console.log(chalk.yellow('Stderr : ' + stderr));
                return stderr
            }
            console.log(chalk.green('Command ' + cmd + ' execs successful\n'));
            return stdout;
        }).catch((err) => {
            console.log(chalk.red('Cmd exec error: ' + err))
        })
}

function cmdsExec(cmds) {
    const commands = Array.from(cmds);
    return commands.reduce((promise, cmd) => {
        return promise.then(() => {
            return cmdExec(cmd)
        })
    }, Promise.resolve())
}

const handleFileError = (fileName) => {
    console.log(chalk.green('Start to remove the file/folder: ' + path.join(process.cwd(), fileName)));
    return base.deleteFolder(path.join(process.cwd(), fileName));
}

module.exports = () => {
    inquirer.prompt(questions)
        .then((answers) => {
            const {
                tplName,
                branchName,
            } = answers;
            console.log(chalk.blue('\nStart generate!'))
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
                    .then((exsits) => {
                        // 存在则强行删除
                        if (exsits) {
                            console.log(chalk.green('Exist the dist folder!\nRemove it!\n'))
                            return handleFileError(projectName)
                        }
                    })
                    .then(() => {
                        console.log(chalk.green(`Begin clone the responsity from the ${url}!`));
                        // cmdExec(cmdStr).then((res) => {
                        //     console.log(chalk.blue('Lucky! You init your project successful!\n'));
                        // }).catch(err => {
                        //     console.log(chalk.red(err))
                        // });
                        // 分步做
                        const commands = cmdStr.split('&&').map((cmd => {
                            return cmd.trim();
                        }));
                        console.log(chalk.blue(commands.reduce((rt, command, index) => {
                            return rt + index + ': ' + command + '\n';
                        }, '\n\nWill exec the following script:\n')));
                        cmdsExec(commands).then((res) => {
                            console.log(chalk.blue('Lucky! You init your project successful!\n'));
                        }).catch(err => {
                            console.log(chalk.red(err));
                        })
                    }).catch(err => {
                        console.log(chalk.red(err))
                    })
            }
        })
        .catch(err => {
            console.log(chalk.red('Wow, something wrong!\n'));
            console.log(chalk.red('Error is ' + err))
        })
}
