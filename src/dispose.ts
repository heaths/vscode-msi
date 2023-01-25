// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

import * as vscode from "vscode";

/**
 * Indicates the item should be disposed.
 */
export interface IDisposable {
    /**
     * Disposes the object.
     */
    dispose(): void;
}

/**
 * Represents a disposable object.
 */
export abstract class Disposable implements IDisposable {
    private _isDisposed = false;

    /**
     * Gets whether this object is already disposed.
     */
    protected get isDisposed() {
        return this._isDisposed;
    }

    /**
     * Gets disposables registered with this object.
     */
    protected disposables: vscode.Disposable[] = [];

    /**
     * Disposes any disposables registered with this object.
     */
    public dispose(): void {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;
        disposeAll(this.disposables);
    }

    /**
     * Registers a disposable object with this object.
     *
     * @param value The disposable object to register with this object.
     * @returns The disposable object.
     */
    protected register<T extends vscode.Disposable>(value: T): T {
        if (this._isDisposed) {
            value.dispose();
        } else {
            this.disposables.push(value);
        }

        return value;
    }
}

/**
 * Disposes an array of disposables.
 *
 * @param disposables An array of disposables to dispose.
 */
export function disposeAll(disposables: vscode.Disposable[]): void {
    while (disposables.length) {
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}
