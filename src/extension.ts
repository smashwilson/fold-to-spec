import * as vscode from 'vscode';
import * as Parser from 'web-tree-sitter';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const handler = new RSpecHandler()

	let disposable = vscode.commands.registerCommand('fold-to-spec.fold', async () => {
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return
		}
		const contents = editor.document.getText()
		const foldPoints = await handler.foldRowsFor(contents)
		vscode.commands.executeCommand('editor.fold', { selectionLines: foldPoints })
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const FOLDED_METHOD_NAMES = new Set([
	'it', 'fit', 'xit', 'before', 'after', 'around', 'let', 'let!',
])

class RSpecHandler {
	private parser: Parser | null = null

	async foldRowsFor(source: string): Promise<number[]> {
		const parser = await this.getInitializedParser()
		const tree = parser.parse(source)

		let foldPoints: number[] = []
		for (const callNode of tree.rootNode.descendantsOfType('call')) {
			if (this.shouldFoldCall(callNode)) {
				foldPoints.push(callNode.startPosition.row)
			}
		}
		for (const methodNode of tree.rootNode.descendantsOfType('method')) {
			foldPoints.push(methodNode.startPosition.row)
		}
		return foldPoints
	}

	private async getInitializedParser(): Promise<Parser> {
		if (this.parser) {
			return this.parser
		}

		await Parser.init()
		this.parser = new Parser()
		const rubyWasmPath = path.join(__dirname, '../parsers/tree-sitter-ruby.wasm')
		const RubyLanguage = await Parser.Language.load(rubyWasmPath)
		this.parser.setLanguage(RubyLanguage)

		return this.parser
	}

	private shouldFoldCall(callNode: Parser.SyntaxNode): boolean {
		const methodName = callNode.children.find(node => node.type === 'identifier')
		if (!methodName) {
			return false
		}

		return FOLDED_METHOD_NAMES.has(methodName.text)
	}
}
