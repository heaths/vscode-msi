// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import * as vscode from "vscode";
import { Disposable } from "./dispose";
import { Package } from "../pkg";

/**
 * Custom document representing a Windows Installer package.
 */
export class PackageDocument extends Disposable implements vscode.CustomDocument {
    /**
     * Opens the {@link Package} if not already open.
     *
     * @returns This {@link PackageDocument}.
     */
    public static async open(uri: vscode.Uri): Promise<PackageDocument> {
        const data = await vscode.workspace.fs.readFile(uri);
        const p = new Package(data);

        return new PackageDocument(uri, p);
    }

    private constructor(
        public readonly uri: vscode.Uri,
        private _package: Package | undefined,
    ) {
        super();
    }

    public dispose(): void {
        if (!this.isDisposed) {
            this._package?.free();
            this._package = undefined;
        }

        super.dispose();
    }
}
