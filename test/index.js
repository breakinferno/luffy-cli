'use strict'
const config = require('../templates')
const chalk = require('chalk')
const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')
const child_process = require('child_process')

const options = ['node_modules']; // 添加库的限制条件，可以用于避免node_modules等文件

const typechoose = (type) => {
    return function (answers) {
        const flag = answers.type === type;
        return flag;
    }
}
// 复制文件
const copyFile = (from, to) => {
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

function filterFileOrFileFolder(regs, stat) {

}


// 递归复制文件夹
function copyDir(src, dist, options, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist, options);
    });

    // 复制的实际操作
    function _copy(err, src, dist, options) {
        if (err) {
            callback(err);
        } else {
            fs.readdir(src, function (err, paths) {
                if (err) {
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        // 这里过滤需要忽视的文件或者文件夹
                        var _src = src + '/' + path;
                        var _dist = dist + '/' + path;
                        fs.stat(_src, function (err, stat) {
                            if (err) {
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    fs.writeFileSync(_dist, fs.readFileSync(_src));
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, options, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
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
    name: 'address',
    message: "Input the github address where the template located.",
    when: typechoose('github')
}, {
    type: 'input',
    name: 'branch',
    message: "What's the branch you will choose?",
    when: typechoose('github')
}]

const test = (options) => {
    let answers = {
        tplName: 'mdzz',
        type: 'local',
        address: 'C:/Users/admin/Desktop/tst',
    }
    new Promise((resolve, reject) => {
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
                copyDir(answers.address, templatePath, options, err => {
                    console.log('copy error!');
                    if (err) {
                        reject(err)
                    }
                })
            })
        }
    }).then(({
        answers,
        config
    }) => {
        console.log('debugger');
        console.log(config);
        console.log(answers);
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
    .catch(err => {
        console.log(chalk.red(err));
    })
}

test(options);