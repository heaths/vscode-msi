// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

/**
 * Returns a pseudorandom nonce.
 *
 * @param len Length of the nonce to return. The default is 32.
 * @returns A pseudorandom nonce.
 */
export function nonce(len = 32): string {
    const MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < len; i++) {
        text += MAP.charAt(Math.floor(Math.random() * MAP.length));
    }
    return text;
}
