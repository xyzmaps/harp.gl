/*
 * Copyright (C) 2018-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

import { GlyphData } from "./GlyphData";
import { TextLayoutStyle, TextRenderStyle } from "./TextStyle";

/**
 * Object containing vertex buffer data generated by [[TextCanvas]].
 */
export class TextBufferObject {
    /**
     * Constructs a new `TextBufferObject`.
     *
     * @param glyphs - Input glyphs.
     * @param buffer - Buffer containing the data generated by [[TextCanvas]].
     * @param bounds - Optional text bounds.
     * @param characterBounds - Optional character bounds.
     * @param textRenderStyle - [[TextRenderStyle]] applied by [[TextCanvas]].
     * @param textLayoutStyle - [[TextLayoutStyle]] applied by [[TextCanvas]].
     *
     * @returns New `TextBufferObject`.
     */
    constructor(
        readonly glyphs: GlyphData[],
        readonly buffer: Float32Array,
        readonly bounds?: THREE.Box2,
        readonly characterBounds?: THREE.Box2[],
        readonly textRenderStyle?: TextRenderStyle,
        readonly textLayoutStyle?: TextLayoutStyle
    ) {}
}