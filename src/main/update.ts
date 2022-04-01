import { ReadAllFiles } from "./textSelect"

const vscode = require('vscode');
const path = require('path')
const { hex_md5 } = require('../utils/md5')

// 文字选择
export default function textSelect(vscode) {
    return vscode.commands.registerTextEditorCommand('vsplugin.updateCommand', async () => {
        const rootPath =
            vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
                ? vscode.workspace.workspaceFolders[0].uri.fsPath
                : undefined;
        let md5Str = hex_md5(rootPath)
        const extensionPath = vscode.extensions.getExtension("protojump.protojump").extensionPath
        let fileName = path.join(extensionPath, `${md5Str}-proto.json`)
        vscode.window.setStatusBarMessage(
            `正在更新索引,请稍后...`, ReadAllFiles(vscode, fileName).then(res => {
                vscode.window.setStatusBarMessage(
                    `更新完成`, 2000)
            }))
    });
}