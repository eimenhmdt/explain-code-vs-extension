const vscode = require("vscode");
const axios = require("axios");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
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

  const makeApiCall = async (content) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful coding assistant that explains code. You must always output html.",
            },
            { role: "user", content },
          ],
          max_tokens: 4096,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      vscode.window.showErrorMessage("Error making API call: " + error.message);
      throw error;
    }
  };

  const showExplanation = async (content) => {
    try {
      const explanation = await makeApiCall(content);
      let panel = vscode.window.createWebviewPanel(
        "explainCode",
        "Explain Code",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      );
      panel.webview.html = `<h1>Explain Code</h1><div>${explanation}</div>`;
      panel.reveal();
    } catch (error) {
      console.error(error);
    }
  };

  let disposable = vscode.commands.registerCommand(
    "explain-code.explainCode",
    async function () {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No file open.");
        return;
      }
      let contents = editor.document.getText();
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Explain Code: Thinking hard...",
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log("User canceled the long running operation");
          });
          await showExplanation(`Explain this file to me: ${contents}`);
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
    async function () {
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
        async (progress, token) => {
          let selectedText = editor.document.getText(editor.selection);
          progress.report({ increment: 10, message: "Thinking hard..." });
          await showExplanation(`Explain this code to me: ${selectedText}`);
          progress.report({ increment: 90, message: "Still thinking hard..." });
        }
      );
    }
  );

  context.subscriptions.push(disposable2);

  let myButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );

  myButton.text = "Explain Code";
  myButton.command = "explain-code.explainCode";
  myButton.show();

  context.subscriptions.push(disposable);
  context.subscriptions.push(myButton);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};