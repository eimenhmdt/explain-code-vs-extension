// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "explain-code" is now active!');
  let openaiKey = vscode.workspace.getConfiguration().get("openaiKey");
  if (!openaiKey) {
    vscode.window
      .showInformationMessage(
        "Click OK to open your settings and set your OpenAI API key to use the Explain Code extension.",
        { modal: true }
      )
      .then(() => {
        vscode.commands.executeCommand("workbench.action.openSettings");
      });

    return;
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "explain-code.explainCode",
    function () {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No file open.");
        return;
      }
      let contents = editor.document.getText();

      // To make the API call, you will need to install the 'request' package
      // You can install it by running 'npm install request' in the extension's root directory
      const request = require("request");

      // Replace YOUR_API_KEY with your actual OpenAI API key
      let options = {
        method: "POST",
        url: "https://api.openai.com/v1/engines/text-davinci-003/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          prompt: `Explain this file to me: ${contents}`,
          max_tokens: 3200,
          n: 1,
        }),
      };
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Explain Code: Thinking hard...",
          cancellable: true,
        },
        (progress, token) => {
          token.onCancellationRequested(() => {
            console.log("User canceled the long running operation");
          });

          // Do the long running operation here
          return new Promise((resolve, reject) => {
            request(options, function (error, response) {
              if (error) {
                vscode.window.showErrorMessage(
                  "Error making API call: " + error
                );
                reject();
              } else {
                let apiResponse = JSON.parse(response.body);

                let panel = vscode.window.createWebviewPanel(
                  "explainCode",
                  "Explain Code",
                  vscode.ViewColumn.Two,
                  {
                    enableScripts: true,
                  }
                );
                panel.webview.html = `<h1>Explain Code</h1>
				<div> ${apiResponse.choices[0].text} </div>`;
                panel.reveal();
                resolve();
              }
            });
          });
        }
      );
    }
  );

  let disposable3 = vscode.languages.registerCodeActionsProvider("*", {
    provideCodeActions: () => {
      let actions = [
        {
          title: "Explain this code",
          command: "explain-code.explainSelectedCode",
        },
      ];
      return actions;
    },
  });
  context.subscriptions.push(disposable3);

  let disposable2 = vscode.commands.registerCommand(
    "explain-code.explainSelectedCode",
    function () {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No file open.");
        return;
      }
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Explain Code",
          cancellable: true,
        },
        (progress, token) => {
          let selectedText = editor.document.getText(editor.selection);
          progress.report({ increment: 10, message: "Thinking hard..." });
          return new Promise((resolve) => {
            const request = require("request");
            let options = {
              method: "POST",
              url: "https://api.openai.com/v1/engines/text-davinci-003/completions",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                prompt: `Explain this code to me: ${selectedText}`,
                max_tokens: 3200,
                n: 1,
              }),
            };
            request(options, function (error, response) {
              if (error) {
                vscode.window.showErrorMessage(
                  "Error making API call: " + error
                );
                resolve();
              } else {
                progress.report({
                  increment: 90,
                  message: "Still thinking hard...",
                });
                let apiResponse = JSON.parse(response.body);
                let panel = vscode.window.createWebviewPanel(
                  "explainCode",
                  "Explain Code",
                  vscode.ViewColumn.Two,
                  {
                    enableScripts: true,
                  }
                );
                panel.webview.html = `<h1>Explain Code</h1>
				  <div> ${apiResponse.choices[0].text} </div>`;
                panel.reveal();
                resolve();
              }
            });
          });
        }
      );
    }
  );

  context.subscriptions.push(disposable2);

  // create a new button
  let myButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );

  myButton.text = "Explain Code";
  myButton.command = "explain-code.explainCode";
  myButton.show();

  context.subscriptions.push(disposable);
  context.subscriptions.push(myButton);
}
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
