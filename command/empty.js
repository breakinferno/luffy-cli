'use strict'
const fs = require('fs')
const path = require('path')
const base = require('./base')
const config = require('../templates.json')
const chalk = require('chalk');
module.exports = () => {
    // 执行删除操作，而非直接更改配置文件
    // fs.writeFile(path.join(__dirname, '../templates.json'), JSON.stringify({"tpl":{}}), 'utf-8', err => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     console.log(chalk.yellow('All the template has been emptied!\n'));
    // })
    const tpls = Object.keys(config.tpl);
    base.deleteFiles(config, tpls)
        .then(() => {
            fs.writeFile(path.join(__dirname, '../templates.json'), JSON.stringify(config), 'utf-8', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(chalk.yellow('All the template has been emptied!\n'));
            })
        })
}