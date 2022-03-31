/**
 * 跳转到定义示例，本示例支持`package.json`中`dependencies`、`devDependencies`跳转到对应依赖包。
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');
import { getWordPos } from "./textSelect"

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
async function provideDefinition(document, position, token) {
    const word = document.getText(document.getWordRangeAtPosition(position));
    console.log('word: ' + word); // 当前光标所在单词
    let fileName = "message.json"
    let osType = os.type()
    let newLine = "\r\n"
    if (osType == "linux") {
        newLine = '\n'
        fileName = path.join("/root", fileName)
    }
    let ret = await getWordPos(fileName, word)
    if (fs.existsSync(ret.path)) {
        // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
        return new vscode.Location(vscode.Uri.file(ret.path), new vscode.Position(ret.line, 0));
    }
    return
}

module.exports = function (context) {
    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['proto3'], {
        provideDefinition
    }));
};