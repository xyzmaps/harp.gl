/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { isJsonExpr } from "./Expr";
import { getStyles, Style, Theme } from "./Theme";

/**
 * The ThemeVisitor visits every style in the theme in a depth-first fashion.
 */
export class ThemeVisitor {
    constructor(readonly theme: Theme) {}
    /**
     * Applies a function to every style in the theme.
     *
     * @param visitFunc - Function to be called with `style` as an argument. Function should return
     *                  `true` to cancel visitation.
     * @returns `true` if function has finished prematurely.
     */
    visitStyles(visitFunc: (style: Style) => boolean): boolean {
        const visit = (style: Style): boolean => {
            if (isJsonExpr(style)) {
                return false;
            }
            if (visitFunc(style)) {
                return true;
            }
            return false;
        };
        if (this.theme.styles !== undefined) {
            for (const style of getStyles(this.theme.styles)) {
                if (visit(style)) {
                    return true;
                }
            }
        }
        return false;
    }
}
