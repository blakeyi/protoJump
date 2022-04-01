/**
 * 跳转到定义示例，本示例支持`package.json`中`dependencies`、`devDependencies`跳转到对应依赖包。
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');
import { getWordPos } from "./textSelect"
const { log } = require('../utils/log')
const { hex_md5 } = require('../utils/md5')

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
async function provideDefinition(document, position, token) {
    const word = document.getText(document.getWordRangeAtPosition(position));
    const extensionPath = vscode.extensions.getExtension("protojump.protojump").extensionPath
    const rootPath =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;
    let md5Str = hex_md5(rootPath)
    let fileName = path.join(extensionPath, `${md5Str}-proto.json`)
    let ret = await getWordPos(fileName, word)
    if (fs.existsSync(ret.path)) {
        // define重复出现? 和vscode-proto3有重合
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