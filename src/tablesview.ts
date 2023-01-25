// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import * as vscode from "vscode";
import { PackageDocument } from "./document";
import { Table } from "../pkg";
import { PackageRegistry } from "./registry";

/**
 * Gets tables from a {@link PackageDocument}.
 */
export class TablesViewProvider implements vscode.TreeDataProvider<TableItem> {
    private static readonly viewType = "msi.tablesView";

    /**
     * Registers this {@link TablesViewProvider}.
     *
     * @param registry The {@link PackageRegistry} to coordinate {@link PackageDocument} views..
     * @returns A disposable representing the registered {@link TablesViewProvider}.
     */
    public static register(
        context: vscode.ExtensionContext,
        registry: PackageRegistry,
    ): vscode.Disposable {
        const provider = new TablesViewProvider(context, registry);
        const disposable = vscode.window.registerTreeDataProvider(TablesViewProvider.viewType, provider);

        return disposable;
    }

    private constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _registry: PackageRegistry,
    ) { }

    public getTreeItem(element: TableItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: TableItem | undefined): TableItem[] | undefined {
        // TODO: Get tables from active PackageDocument.
        return [
            new TableItem("Property"),
        ];
    }
}

/**
 * Represents a {@link Table} in a tree view.
 */
export class TableItem extends vscode.TreeItem {
    public constructor(
        public readonly label: string,
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
    }
}
