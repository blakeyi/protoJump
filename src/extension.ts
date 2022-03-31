
// vscode包含了官方所有的能力(API)
import * as vscode from 'vscode';
import textSelect from "./main/textSelect";
import update from "./main/update";


// 插件激活的钩子函数
export function activate(context: vscode.ExtensionContext) {
    // 显示当前选择的文字
    let textSelectCommand = textSelect(vscode);
    let updateCommand = update(vscode);

    // 所有的命令都要放到subscriptions执行队列中去
    context.subscriptions.push(textSelectCommand);
    context.subscriptions.push(updateCommand);
    require('./main/hoverSelect')(context); // 跳转到定义
}


// 插件失活钩子函数
export function deactivate() { }
