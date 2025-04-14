// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ollama from "ollama";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // console.log('"vs-ext" is now active!!!!');
  const disposable = vscode.commands.registerCommand("vs-ext.himom", () => {
    vscode.window.showErrorMessage("Hello mom from vs-ext!");
  });

  const panel = vscode.window.createWebviewPanel(
    "deepChat",
    "Deep Seek Chat",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent();

  panel.webview.onDidReceiveMessage(async (message: any) => {
    if (message.command === "chat") {
      const userPrompt = message.text;
      let responseText = "";

      // pass message to ollama
      try {
        const streamResponse = await ollama.chat({
          model: "deepseek-r1:latest",
          messages: [{ role: "user", content: userPrompt }],
          stream: true,
        });

        for await (const part of streamResponse) {
          responseText += part.message.content;
          panel.webview.postMessage({
            command: "chatResponse",
            text: responseText,
          });
        }
      } catch (err) {
        panel.webview.postMessage({
          command: "chatResponse",
          text: `Error: ${String(err)}`,
        });
      }
    }
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <style>
        body {font-family: sans-serif; margin: 1rem;}
        #prompt {width: 100%; box-sizing: border-box;}
        #response {border: 1px solid #ccc; margin-top: 1rem; padding: 0.5rem;}
      </style>
    </head>
    <body>
      <h2>Deep VS Code Extension</h2>
      <textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
      <button id="askBtn">Ask</button>
      <div id="response"></div>

      <script>
        const vscode = acquireVsCodeApi(); // connect vscode api
        
        document.getElementById('askBtn').addEventListener('click', () =>{
          const text = document.getElementById('prompt').value;
          vscode.postMessage({command: 'chat', text});
        });

        // listen chat response
        window.addEventListener('message', event => {
          const {command, texxt} = event.data;
          if (command === 'chatResponse' {
            document.getElementById('response').innerText = text;
          })
        })
      </script>
    </body>
    </html>
`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
