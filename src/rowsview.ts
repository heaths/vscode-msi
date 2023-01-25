// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import * as vscode from "vscode";
import { PackageDocument } from "./document";
import { PackageRegistry } from "./registry";
import * as util from "./util";

/**
 * A {@link PackageDocument} row viewer.
 */
export class RowsViewer implements vscode.CustomReadonlyEditorProvider<PackageDocument> {
    private static readonly viewType = "msi.rowsView";

    /**
     * Registers the {@link RowsViewer}.
     *
     * @param context The {@link vscode.ExtensionContext} when the extension was activated.
     * @param registry The {@link PackageRegistry} to manage document views.
     * @returns A {@link vscode.Disposable} used to clean up this view.
     */
    public static register(
        context: vscode.ExtensionContext,
        registry: PackageRegistry,
    ): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            RowsViewer.viewType,
            new RowsViewer(context, registry),
            {
                supportsMultipleEditorsPerDocument: false,
            },
        );
    }

    private constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _registry: PackageRegistry,
    ) { }

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken): Promise<PackageDocument> {
        return await PackageDocument.open(uri);
    }

    public resolveCustomEditor(
        document: PackageDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken): void {
        const handle = this._registry.add(document);
        webviewPanel.onDidDispose(() => handle.dispose());

        webviewPanel.webview.options = {
            enableScripts: true,
        };

        const nonce = util.nonce();
        const htmlUri = vscode.Uri.joinPath(this._context.extensionUri, "dist", "index.html");

        webviewPanel.webview.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' 'wasm-unsafe-eval';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script nonce="${nonce}" src="element.js" defer></script>
                    <title>Row Viewer</title>
                </head>
                <body>
                    <h1>Row Viewer</h1>
                </body>
            </html>
            `;
    }
}
