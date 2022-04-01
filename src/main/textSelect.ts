import { Position, Range, TextEdit, TextEditor, TextEditorEdit, Location, Uri, ViewColumn, window, LocationLink } from "vscode";
const fs = require("fs");
const os = require('os');
const path = require('path');
const { log } = require('../utils/log')
const { hex_md5 } = require('../utils/md5')


// 文字选择
export default function textSelect(vscode) {
    return vscode.commands.registerTextEditorCommand('vsplugin.textSelectCommand', async (textEditor: TextEditor, edit: TextEditorEdit) => {
        let start = textEditor.selection.start
        // let end = textEditor.selection.end
        // let range = new Range(start, end)
        // let doc = textEditor.document
        // let line = doc.lineAt(start.line)
        // 通过当前鼠标位置获得word
        let range1 = textEditor.document.getWordRangeAtPosition(start)
        let text = textEditor.document.getText(range1)
        const rootPath =
            vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
                ? vscode.workspace.workspaceFolders[0].uri.fsPath
                : undefined;
        let md5Str = hex_md5(rootPath)
        const extensionPath = vscode.extensions.getExtension("protojump.protojump").extensionPath
        // 第一次先判断是否存在文件
        try {
            let fileName = path.join(extensionPath, `${md5Str}-proto.json`)
            fs.accessSync(fileName, fs.constants.R_OK);
            let word = await getWordPos(fileName, text)
            if (word !== null) {
                const options = {
                    selection: new Range(new Position(word.line, 0), new Position(word.line, 0)),
                    // 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
                    preview: true,
                    // 显示在第二个编辑器
                    viewColumn: ViewColumn.One
                };
                window.showTextDocument(Uri.file(word.path), options);
                return
            }
            vscode.window.showInformationMessage(
                `你选择的是${text}, 未找到定义`)

        } catch (err) {
            // let exPath = vscode.extensions.getExtension("protojump").extensionPath
            let fileName = path.join(extensionPath, `${md5Str}-proto.json`)
            vscode.window.showInformationMessage(
                `正在初始化,请稍后...`)
            ReadAllFiles(vscode, fileName)
        }

    });
}


export async function getWordPos(fileName, word) {
    let str = fs.readFileSync(fileName)
    let data = JSON.parse(str)
    let ret = null

    for (let index = 0; index < data.enum.length; index++) {
        if (data.enum[index].name == word) {
            return data.enum[index]
        }
    }
    for (let index = 0; index < data.message.length; index++) {
        if (data.message[index].name == word) {
            return data.message[index]
        }
    }
    return ret
}


async function GetAllProtoFiles(vscode) {
    return vscode.workspace.findFiles("**/*.proto");
}

// 删除前后指定字符
function Trim(src, char, position) {
    if (char) {
        if (position == 'left') {
            return src.replace(new RegExp('^\\' + char + '+', 'g'), '');
        } else if (position == 'right') {
            return src.replace(new RegExp('\\' + char + '+$', 'g'), '');
        }
        return src.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return src.replace(/^\s+|\s+$/g, '');
}

export async function ReadAllFiles(vscode, fileName) {
    let osType = os.type()
    let newLine = "\r\n"
    if (osType == "Linux") {
        newLine = '\n'
    }
    let files = await GetAllProtoFiles(vscode);
    let ret = {
        enum: [],
        message: []
    }
    files.forEach(file => {
        let data = fs.readFileSync(file.fsPath, { encoding: "utf-8" })
        let lines = data.split(newLine)
        lines.forEach((element, index) => {
            if (element.search(/^enum.*/i) != -1) {
                let list = element.split(' ')
                if (list.length < 2) {
                    return
                }
                let name = Trim(list[1], '{', '')
                ret.enum.push({
                    name: name,
                    path: file.fsPath,
                    line: index
                })
                return
            }

            if (element.search(/^message.*/i) != -1) {
                let list = element.split(' ')
                if (list.length < 2) {
                    return
                }
                let name = Trim(list[1], '{', '')
                ret.message.push({
                    name: name,
                    path: file.fsPath,
                    line: index
                })
                return
            }

        });

    });
    return fs.writeFileSync(fileName, JSON.stringify(ret));
}

