// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import * as vscode from "vscode";
import { PackageRegistry } from "./registry";
import { RowsViewer } from "./rowsview";
import { TablesViewProvider } from "./tablesview";

/**
 * Called when the extension is first activated.
 *
 * @param context The current {@link vscode.ExtensionContext} for this extension.
 * @returns Nothing.
 */
export function activate(context: vscode.ExtensionContext): void {
    const registry = new PackageRegistry();
    context.subscriptions.push(TablesViewProvider.register(context, registry));
    context.subscriptions.push(RowsViewer.register(context, registry));
}

/**
 * Called when the extension is finally deactivated.
 */
export function deactivate(): void { }
