import { ReadAllFiles } from "./textSelect"

const vscode = require('vscode');

// 文字选择
export default function textSelect(vscode) {
    return vscode.commands.registerTextEditorCommand('vsplugin.updateCommand', async () => {
        let wcTimeout = null;
        let setWCTimeout = function () {
            clearWCTimeout();
            wcTimeout = setTimeout(clearWCTimeout, 500);
        };
        let clearWCTimeout = function () {
            if (wcTimeout !== null) {
                clearTimeout(wcTimeout);
                wcTimeout = null;
                // clear/hide the message box here, but how?
            }
        };
        setWCTimeout();
        vscode.window.showInformationMessage(
            `正在更新索引,请稍后...`).then(clearWCTimeout)
        let fileName = "message.json"
        ReadAllFiles(vscode, fileName)
    });
}