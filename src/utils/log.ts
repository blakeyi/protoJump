const fs = require('fs')
const vscode = require('vscode');
const path = require('path')

const extensionPath = vscode.extensions.getExtension("protojump.protojump").extensionPath
export function log(msg) {
    fs.appendFileSync(path.join(extensionPath, "protojump.log"), msg + '\n');
}

