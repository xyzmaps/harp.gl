/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2020-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureCollection } from "@xyzmaps/harp-datasource-protocol";
import { GeoPointLike } from "@xyzmaps/harp-geoutils";
import { MapControls, MapControlsUI } from "@xyzmaps/harp-map-controls";
import { CopyrightElementHandler, MapView } from "@xyzmaps/harp-mapview";
import { GeoJsonTiler } from "@xyzmaps/harp-mapview-decoder/lib/GeoJsonTiler";
import { GeoJsonDataProvider, VectorTileDataSource } from "@xyzmaps/harp-vectortile-datasource";
import { VectorTileDecoder } from "@xyzmaps/harp-vectortile-datasource/index-worker";
import * as turf from "@turf/turf";

export namespace GeoJsonVisibilityExample {
    async function main(id: string): Promise<MapView> {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const NY = [-74.01, 40.707];
        const mapView = new MapView({
            canvas,
            theme: "resources/berlin_tilezen_base.json",
            target: NY as GeoPointLike,
            zoomLevel: 15.1
        });

        CopyrightElementHandler.install("copyrightNotice", mapView);

        const mapControls = new MapControls(mapView);
        mapControls.maxTiltAngle = 50;

        const ui = new MapControlsUI(mapControls, { zoomLevel: "input" });
        canvas.parentElement!.appendChild(ui.domElement);

        mapView.resize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            mapView.resize(window.innerWidth, window.innerHeight);
        });

        const omvDataSource = new VectorTileDataSource({
            url: "https://demo.xyzmaps.org/maps/osm/{z}/{x}/{y}.pbf"
        });

        mapView.addDataSource(omvDataSource);

        omvDataSource.dataSourceOrder = 0;

        const circle = turf.circle(NY, 1000, {
            units: "meters"
        });

        const points = turf.randomPoint(100, {
            bbox: turf.bbox(circle)
        });

        points.features = points.features.filter(
            feature => turf.distance(NY, feature.geometry!.coordinates, { units: "meters" }) < 1000
        );

        const dataProvider = new GeoJsonDataProvider(
            "geojson",
            // @ts-ignore
            turf.featureCollection([circle, ...points.features]) as FeatureCollection,
            { tiler: new GeoJsonTiler() }
        );

        const featuresDataSource = new VectorTileDataSource({
            decoder: new VectorTileDecoder(),
            styleSetName: "geojson",
            dataProvider,
            addGroundPlane: false
        });

        featuresDataSource.dataSourceOrder = 1;

        await mapView.addDataSource(featuresDataSource);

        await featuresDataSource.setTheme({
            styles: [
                {
                    styleSet: "geojson",
                    when: ["==", ["geometry-type"], "Polygon"],
                    technique: "fill",
                    color: "rgba(200,94,202,0.5)",
                    minZoomLevel: 15,
                    maxZoomLevel: 17
                },
                {
                    styleSet: "geojson",
                    when: ["==", ["geometry-type"], "Point"],
                    technique: "circles",
                    color: "rgba(94,0,202,1)",
                    size: 30,
                    minZoomLevel: 15,
                    maxZoomLevel: 17
                }
            ]
        });

        dataProvider.onDidInvalidate(() => {
            mapView.update();
        });

        const animate = () => {
            turf.transformRotate(points, 5, {
                pivot: NY,
                mutate: true
            });

            dataProvider.updateInput(
                // @ts-ignore
                turf.featureCollection([circle, ...points.features]) as FeatureCollection
            );
        };

        setInterval(animate, 100);

        return mapView;
    }

    // eslint-disable-next-line no-console
    main("mapCanvas").catch(console.error);
}
