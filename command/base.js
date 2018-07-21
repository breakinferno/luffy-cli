const fs = require('fs-extra');
const path = require('path')


const deleteFile = (config, tpl) => {
    const location = config.tpl[tpl] ? config.tpl[tpl].type : null;
    const templateUrl = path.join(__dirname, '../templates', tpl);
    if (location === 'local') {
        return new Promise((resolve, reject) => {
            fs.remove(templateUrl, err => {
                if (err) {
                    console.log(chalk('remove dir failed!'));
                    reject(err)
                }
                delete config['tpl'][tpl]
                resolve()
            })
        })
    }
    delete config['tpl'][tpl]
    return Promise.resolve();
}

const deleteFiles = (config, tpls) => {
    const promises = tpls.map(tpl => {
        return deleteFile(config, tpl);
    })
    return Promise.all(promises)
}

exports.deleteFiles = deleteFiles