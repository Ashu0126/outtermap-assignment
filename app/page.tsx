"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { Style, Fill, Stroke } from "ol/style";
import { getArea } from "ol/sphere";
import styles from "./page.module.css";

export default function Home() {
  const mapRef = useRef<any>(null);
  const pointsRef = useRef<any>([]);
  const polygonRef = useRef<any>(null);
  const [polyCoord, setPolyCoord] = useState<any>();
  const [area, setArea] = useState<any>("");

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 3,
      }),
    });

    map.on("click", (e) => {
      const clickedCoord = e.coordinate;
      addPointerAtCoord(map, clickedCoord);
    });
  }, []);

  const addPointerAtCoord = (map: any, coord: any) => {
    const points: any = pointsRef.current;

    const pointFeature = new Feature({
      geometry: new Point(coord),
    });

    points.push(pointFeature);

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: points,
      }),
    });

    map.addLayer(vectorLayer);

    if (points.length > 1) {
      const polygonCoords = points.map((point: any) =>
        point.getGeometry().getCoordinates()
      );
      setPolyCoord(polygonCoords);

      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
      }

      const polygonFeature = new Feature({
        geometry: new Polygon([polygonCoords]),
      });

      const polygonVectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [polygonFeature],
        }),
        style: new Style({
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "blue",
            width: 2,
          }),
        }),
      });

      polygonRef.current = polygonVectorLayer;
      map.addLayer(polygonVectorLayer);
    }
  };

  const handleClick = () => {
    setArea(getArea(new Polygon([polyCoord])));
  };

  return (
    <main className={styles.main} ref={mapRef}>
      {pointsRef.current.length > 2 && (
        <button className={styles.find} onClick={handleClick}>
          Get Area
        </button>
      )}
      {area && (
        <div className={styles.areaInfo}>
          <h3 className={styles.heading}>Area of shaded polygon</h3>
          <p>{area}</p>
        </div>
      )}
    </main>
  );
}
