// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import { timeStamp } from "console";
import * as vscode from "vscode";
import { Disposable } from "./dispose";
import { PackageDocument } from "./document";

/**
 * Registry of opened {@link PackageDocument}s used for managing views.
 */
export class PackageRegistry extends Disposable {
    // TODO: Hook up a message handler for each document.
    private readonly _documents = new Map<PackageDocument, undefined>();
    private readonly _onChangeEmitter = new vscode.EventEmitter<PackageDocument | undefined>();
    private _activeDocument?: PackageDocument;

    public constructor() {
        super();
        this.register(vscode.window.tabGroups.onDidChangeTabs(this.onChangedTabs, this));
        this.onChangedTabs();
    }

    /**
     * Fires when the active package viewer changes.
     */
    public readonly onDidChangeActiveDocument = this._onChangeEmitter.event;

    /**
     * Gets the active {@link PackageDocument}.
     */
    public get activeDocument() {
        return this._activeDocument;
    }

    /**
     * Adds the document to the registry and switches to a tab to view it.
     *
     * @param document The document to add and switch to.
     * @returns A disposable object that will remove the document from the registry.
     */
    public add(document: PackageDocument) {
        if (!this._documents.has(document)) {
            this._documents.set(document, undefined);
        }

        this.onChangedTabs();

        return {
            dispose: () => {
                this._documents.delete(document);
            },
        };
    }

    private find(uri: vscode.Uri) {
        const _uri = uri.toString();
        for (const doc of this._documents.keys()) {
            if (doc.uri.toString() === _uri) {
                return doc;
            }
        }
        return undefined;
    }

    private onChangedTabs() {
        const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
        const uri = input instanceof vscode.TabInputCustom ? input.uri : undefined;
        let next: PackageDocument | undefined = undefined;

        if (uri) {
            next = this.find(uri);
        }

        if (next === this._activeDocument) {
            return;
        }

        this._activeDocument = next;
        vscode.commands.executeCommand("setContext", "msi:isActive", !!next);
        this._onChangeEmitter.fire(next);
    }
}
