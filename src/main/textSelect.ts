import { Position, Range, TextEdit, TextEditor, TextEditorEdit, Location, Uri, ViewColumn, window } from "vscode";
const fs = require("fs");
const os = require('os');
// 文字选择
export default function textSelect(vscode) {
    return vscode.commands.registerTextEditorCommand('vsplugin.textSelectCommand', async (textEditor: TextEditor, edit: TextEditorEdit) => {
        let start = textEditor.selection.start
        let end = textEditor.selection.end
        let range = new Range(start, end)
        let doc = textEditor.document
        let line = doc.lineAt(start.line)
        let text = textEditor.document.getText(range)

        const rootPath =
            vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
                ? vscode.workspace.workspaceFolders[0].uri.fsPath
                : undefined;

        // 第一次先判断是否存在文件
        try {
            fs.accessSync('message.json', fs.constants.R_OK);

            let word = await getWordPos(text)
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
            vscode.window.showInformationMessage(
                `正在初始化,请稍后...`)
            ReadAllFiles(vscode)
        }

    });
}


function isMessageOrEnum(line) {
    if (line.search(/^enum.*(?!s|$)/i) != -1 || line.search(/^message.*(?!s|$)/i) != -1) {
        return true
    }
    return false
}

async function getWordPos(word) {
    let str = fs.readFileSync("message.json")
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


async function ReadAllFiles(vscode) {
    let osType = os.type()
    let newLine = "\r\n"
    if (osType == "linux") {
        newLine = '\n'
    }
    let files = await GetAllProtoFiles(vscode);
    let ret = {
        enum: [],
        message: []
    }
    let count = files.length;
    files.forEach(file => {
        let data = fs.readFileSync(file.fsPath, { encoding: "utf-8" })
        let lines = data.split(newLine)
        lines.forEach((element, index) => {
            if (element.search(/^enum.*(?!s|$)/i) != -1) {
                let list = element.split(' ')
                if (list.length < 2) {
                    return
                }
                ret.enum.push({
                    name: list[1],
                    path: file.fsPath,
                    line: index
                })
                return
            }

            if (element.search(/^message.*(?!s|$)/i) != -1) {
                let list = element.split(' ')
                if (list.length < 2) {
                    return
                }
                ret.message.push({
                    name: list[1],
                    path: file.fsPath,
                    line: index
                })
                return
            }

        });
        console.log(ret);
        console.log(os.type());
        count--;
        if (count <= 0) {
            // this.OnReadComplete();
            console.log(111);
        }

    });
    console.log(ret)
    fs.writeFileSync('message.json', JSON.stringify(ret));
}

