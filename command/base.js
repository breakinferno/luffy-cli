const fs = require('fs-extra');
const path = require('path')
const chalk = require('chalk')
// 复制文件(夹)
exports.copyFiles = (from, to, filter, callback) => {
    return new Promise((resolve, reject) => {
        fs.copy(from, to, filter, err => {
            if (err) {
                return reject(err, to)
            }
            typeof callback === 'function' ? callback(resolve) : null;
        })
    })
}

// 创建文件夹

// 判断是否存在文件夹
exports.isExistFolder = (filePath, fileName) => {
    const dir = path.join(filePath, fileName);
    return new Promise((resolve, reject) => {
        fs.ensureDir(dir, err => {
            if (err) {
                console.log(chalk.red(err));
                return reject(err)
            }
            resolve();
        })
    })
}
// 删除文件夹
exports.deleteFolder = (url) => {
    return new Promise((resolve, reject) => {
        fs.remove(url, err => {
            if (err) {
                console.log(chalk.red('Delete Folder Error:' + err));
                return reject(err)
            }
            resolve();
        })
    })
}

// 删除模板
const deleteFile = (config, tpl) => {
    const location = config.tpl[tpl] ? config.tpl[tpl].type : null;
    const templateUrl = path.join(__dirname, '../templates', tpl);
    if (location === 'local') {
        return new Promise((resolve, reject) => {
            fs.remove(templateUrl, err => {
                if (err) {
                    console.log(chalk.red('remove dir failed!'));
                    return reject(err)
                }
                delete config['tpl'][tpl]
                resolve()
            })
        })
    }
    delete config['tpl'][tpl]
    return Promise.resolve();
}

exports.deleteFile = deleteFile

// 删除所有模板
const deleteFiles = (config, tpls) => {
    const promises = tpls.map(tpl => {
        return deleteFile(config, tpl);
    })
    return Promise.all(promises)
}

exports.deleteFiles = deleteFiles