// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitExtension } from './git';

const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
const git = gitExtension?.getAPI(1);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-context-menu" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposables: vscode.Disposable[] = [];

	// Add file to git changes
	disposables.push(vscode.commands.registerCommand('git-context-menu.addFile', (...file) => {
		let filePath = file[0]?.fsPath;
		let fileName = file[0]?.path.split('/').pop();
		const repo = git?.repositories[0];
		if (repo && filePath) {
			repo.add([filePath]);
		}
		vscode.window.showInformationMessage(`Git: File added - ${fileName}`);
	}));
	// Add folder to git changes
	disposables.push(vscode.commands.registerCommand('git-context-menu.addFolder', (...file) => {
		let filePath = file[0]?.fsPath;
		let fileName = file[0]?.path.split('/').pop();
		const repo = git?.repositories[0];
		if (repo && filePath) {
			repo.add([filePath]);
		}
		vscode.window.showInformationMessage(`Git: Folder and contents added - ${fileName}`);
	}));

	// Unstage file from git changes
	disposables.push(vscode.commands.registerCommand('git-context-menu.unstageFile', async (...file) => {
		let filePath = file[0]?.fsPath;
		let fileName = file[0]?.path.split('/').pop();
		const repo = git?.repositories[0];
		if (repo && filePath) {
			// Check if file is staged
			const isStaged = repo.state.indexChanges.some(change => change.uri.fsPath === filePath);
			if (!isStaged) {
				vscode.window.showWarningMessage(`Git: Nothing to unstage - ${fileName}`);
				return;
			}
			await repo.revert([filePath]);
			vscode.window.showInformationMessage(`Git: File unstaged - ${fileName}`);
		}
	}));
	// Unstage folder from git changes
	disposables.push(vscode.commands.registerCommand('git-context-menu.unstageFolder', async (...file) => {
		let filePath = file[0]?.fsPath;
		let fileName = file[0]?.path.split('/').pop();
		const repo = git?.repositories[0];
		if (repo && filePath) {
			// Check if any files in folder are staged
			const hasStagedFiles = repo.state.indexChanges.some(change => 
				change.uri.fsPath.startsWith(filePath)
			);
			if (!hasStagedFiles) {
				vscode.window.showWarningMessage(`Git: Nothing to unstage in folder - ${fileName}`);
				return;
			}
			await repo.revert([filePath]);
			vscode.window.showInformationMessage(`Git: Folder and contents unstaged - ${fileName}`);
		}
	}));

	// Show the diff of a file
	disposables.push(vscode.commands.registerCommand('git-context-menu.showDiff', (...file) => {
		let filePath = file[0]?.fsPath;
		let fileName = file[0]?.path.split('/').pop();
		const repo = git?.repositories[0];
		if (repo && filePath && git) {
			const uri = vscode.Uri.file(filePath);
			const headUri = git.toGitUri(uri, 'HEAD');
			vscode.commands.executeCommand('vscode.diff', headUri, uri, `${fileName} (HEAD ↔ Working Tree)`, { preview: true });
		}
	}));

	context.subscriptions.push(vscode.Disposable.from(...disposables));
}

// This method is called when your extension is deactivated
export function deactivate() {}
