/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { Styles, TextureCoordinateType, Theme } from "@xyzmaps/harp-datasource-protocol";
import { isJsonExpr } from "@xyzmaps/harp-datasource-protocol/lib/Expr";
import { GeoCoordinates } from "@xyzmaps/harp-geoutils";
import { MapControls, MapControlsUI } from "@xyzmaps/harp-map-controls";
import { CopyrightElementHandler, MapView, ThemeLoader } from "@xyzmaps/harp-mapview";
import { VectorTileDataSource } from "@xyzmaps/harp-vectortile-datasource";

export namespace HelloWorldTexturedExample {
    function main() {
        addTextureCopyright();

        const mapView = initializeMapView("mapCanvas");

        const omvDataSource = new VectorTileDataSource({
            url: "https://demo.xyzmaps.org/maps/osm/{z}/{x}/{y}.pbf"
        });

        mapView.addDataSource(omvDataSource);
    }

    function addTextureCopyright() {
        document.body.innerHTML += `
<style>
    #mapCanvas {
        top: 0;
    }
    #texture-license{
        margin: 10px;
        padding: 10px;
        color: #cccccc;
    }
</style>
<p id="texture-license">Textures by
<a href="https://opengameart.org/content/wall-grass-rock-stone-wood-and-dirt-480" target="_blank">
West</a>.</p>`;
    }

    /**
     * Modify the theme after loading and replace some area features that use the [[FillTechnique]]
     * to use [[StandardTexturedTechnique]] instead.
     * This enables lighting for these areas and allows to specify textures.
     * This could solely be done in the theme json file but for explanatory reasons it's done here.
     * @param theme - The theme that should be modified.
     * @returns The modified theme.
     */
    function modifyTheme(theme: Theme): Theme {
        const urbanAreaTexture = "resources/wests_textures/paving.png";
        const parkTexture = "resources/wests_textures/clover.png";

        if (theme.styles) {
            (theme.styles as Styles).forEach(style => {
                if (isJsonExpr(style)) {
                    return;
                }
                if (style.description === "urban area") {
                    style.technique = "standard";
                    style.attr = {
                        color: "#ffffff",
                        map: urbanAreaTexture,
                        mapProperties: {
                            repeatU: 10,
                            repeatV: 10,
                            wrapS: "repeat",
                            wrapT: "repeat"
                        },
                        textureCoordinateType: TextureCoordinateType.TileSpace
                    };
                } else if (style.description === "park") {
                    style.technique = "standard";
                    style.attr = {
                        color: "#ffffff",
                        map: parkTexture,
                        mapProperties: {
                            repeatU: 5,
                            repeatV: 5,
                            wrapS: "repeat",
                            wrapT: "repeat"
                        },
                        textureCoordinateType: TextureCoordinateType.TileSpace
                    };
                } else if (style.description === "building_geometry") {
                    // Disable extruded buildings to reduce noise.
                    style.technique = "none";
                }
            });
        }
        return theme;
    }

    function initializeMapView(id: string): MapView {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const themePromise: Promise<Theme> = ThemeLoader.load("resources/berlin_tilezen_base.json");
        const map = new MapView({
            canvas,
            theme: themePromise.then(modifyTheme)
        });
        const NY = new GeoCoordinates(40.705, -74.01);
        map.lookAt({ target: NY, zoomLevel: 16.1, tilt: 30 });

        CopyrightElementHandler.install("copyrightNotice", map);

        const mapControls = new MapControls(map);
        const ui = new MapControlsUI(mapControls);
        canvas.parentElement!.appendChild(ui.domElement);

        map.resize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            map.resize(window.innerWidth, window.innerHeight);
        });

        return map;
    }

    main();
}
