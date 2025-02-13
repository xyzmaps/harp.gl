/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { Definitions, getStyles, Styles, Theme } from "@xyzmaps/harp-datasource-protocol";
import {
    Expr,
    isJsonExpr,
    JsonExpr,
    StyleSetEvaluator
} from "@xyzmaps/harp-datasource-protocol/index-decoder";
import { loadTestResource } from "@xyzmaps/harp-test-utils";
import * as Ajv from "ajv";
import { assert } from "chai";
import * as path from "path";

/* eslint-disable no-console */

//    Mocha discourages using arrow functions, see https://mochajs.org/#arrow-functions

function assertExprValid(
    expr: JsonExpr,
    definitions: Definitions | undefined,
    expressionName: string
) {
    // assert.doesNotThrow has bad signature :/
    const doesNotThrow = assert.doesNotThrow as (
        fn: () => void,
        err: new () => Error,
        regexp: RegExp | null,
        message: string
    ) => void;

    doesNotThrow(
        () => {
            Expr.fromJSON(expr, definitions);
        },
        Error,
        null,
        `failed to parse expression "${JSON.stringify(expr)}" at ${expressionName}`
    );
}

describe("Berlin Theme", function () {
    let ajv: Ajv.Ajv;
    let schemaValidator: Ajv.ValidateFunction;
    before(async () => {
        ajv = new Ajv({ unknownFormats: "ignore", logger: false });
        const theme = await loadTestResource(
            "@xyzmaps/harp-datasource-protocol",
            "./theme.schema.json",
            "json"
        );
        schemaValidator = ajv.compile(theme);
    });

    const themes = [
        "resources/berlin_derived.json",
        "resources/berlin_tilezen_base.json",
        "resources/berlin_tilezen_base_globe.json",
        "resources/berlin_tilezen_day_reduced.json",
        "resources/berlin_tilezen_night_reduced.json",
        "resources/berlin_tilezen_effects_outlines.json",
        "resources/berlin_tilezen_effects_streets.json"
    ];

    themes.forEach(themePath => {
        const baseName = path.basename(themePath);
        describe(`${baseName}`, function () {
            let theme: Theme;
            before(async () => {
                theme = await loadTestResource("@xyzmaps/harp-map-theme", themePath, "json");
            });

            it(`complies with JSON schema`, async function () {
                const valid = schemaValidator(theme);
                if (!valid && schemaValidator.errors) {
                    console.log("validation errors", schemaValidator.errors.length);
                    console.log(schemaValidator.errors);
                }
                assert.isTrue(valid);
            });

            it(`works with StyleSetEvaluator`, async function () {
                new StyleSetEvaluator({
                    styleSet: getStyles(theme.styles),
                    definitions: theme.definitions
                });
            });

            it(`contains proper expressions in StyleSets`, async function () {
                const styles = theme.styles as Styles;
                for (let i = 0; i < styles.length; ++i) {
                    const style = styles[i];
                    const location = `${styles[i].styleSet}[${i}]`;
                    if (typeof style.when === "string") {
                        assert.doesNotThrow(() => Expr.parse(style.when as string));
                    } else if (style.when !== undefined) {
                        assertExprValid(style.when, theme.definitions, `${location}.when`);
                    }

                    for (const attrName in style.attr) {
                        const attrValue = (style.attr as any)[attrName];
                        if (!isJsonExpr(attrValue)) {
                            continue;
                        }
                        assertExprValid(
                            attrValue,
                            theme.definitions,
                            `${location}.attrs.${attrName}`
                        );
                    }
                }
            });
        });
    });
});
