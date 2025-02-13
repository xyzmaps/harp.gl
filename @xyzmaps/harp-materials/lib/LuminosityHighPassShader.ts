/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

/**
 * The shader used in the [[UnrealBloomPass]] for the bloom/glow effect.
 */
export const LuminosityHighPassShader: THREE.Shader = {
    uniforms: {
        tDiffuse: { value: null },
        luminosityThreshold: { value: 1.0 },
        smoothWidth: { value: 1.0 },
        defaultColor: { value: new THREE.Color(0x000000) },
        defaultOpacity: { value: 0.0 }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 defaultColor;
    uniform float defaultOpacity;
    uniform float luminosityThreshold;
    uniform float smoothWidth;
    varying vec2 vUv;
    void main() {
        vec4 texel = texture2D( tDiffuse, vUv );
        vec3 luma = vec3( 0.299, 0.587, 0.114 );
        float v = dot( texel.xyz, luma );
        vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );
        float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );
        gl_FragColor = mix( outputColor, texel, alpha );
    }`
};
