import React, { useState, useRef } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import type { Coordinates } from "@/types/api";

// Dynamically loaded only on native
let MapViewComponent: any = null;
let Marker: any = null;
let Polygon: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== "web") {
  const maps = require("react-native-maps");
  MapViewComponent = maps.default;
  Marker = maps.Marker;
  Polygon = maps.Polygon;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

interface RegionType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  initialRegion?: RegionType;
  markerCoordinate?: Coordinates;
  onMarkerDragEnd?: (coordinate: Coordinates) => void;
  onLongPress?: (coordinate: Coordinates) => void;
  gridBoundaries?: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  showGrid?: boolean;
  height?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  initialRegion = {
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  markerCoordinate,
  onMarkerDragEnd,
  onLongPress,
  gridBoundaries,
  showGrid = false,
  height = 400,
}) => {
  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState<RegionType>(initialRegion);

  const handleLongPress = (event: any) => {
    if (onLongPress) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLongPress({ latitude, longitude });
    }
  };

  const handleMarkerDragEnd = (event: any) => {
    if (onMarkerDragEnd) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onMarkerDragEnd({ latitude, longitude });
    }
  };

  const gridPolygonCoords = gridBoundaries
    ? [
        { latitude: gridBoundaries.lat_min, longitude: gridBoundaries.lon_min },
        { latitude: gridBoundaries.lat_max, longitude: gridBoundaries.lon_min },
        { latitude: gridBoundaries.lat_max, longitude: gridBoundaries.lon_max },
        { latitude: gridBoundaries.lat_min, longitude: gridBoundaries.lon_max },
      ]
    : [];

  // ---------------- WEB FALLBACK ----------------
  if (Platform.OS === "web") {
    return (
      <View style={[styles.webMapPlaceholder, { height }]}>
        <Text style={styles.webMapText}>
          Map View (Web Preview - Run on device for full functionality)
        </Text>

        {markerCoordinate && (
          <View style={styles.webCoordinateInfo}>
            <Text>Lat: {markerCoordinate.latitude.toFixed(6)}</Text>
            <Text>Lon: {markerCoordinate.longitude.toFixed(6)}</Text>
          </View>
        )}
      </View>
    );
  }

  // ---------------- NATIVE MAP ----------------
  return (
    <View style={[styles.container, { height }]}>
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        onLongPress={handleLongPress}
        showsUserLocation
        showsMyLocationButton
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            draggable
            onDragEnd={handleMarkerDragEnd}
            title="Selected Location"
          />
        )}
        {showGrid && gridBoundaries && (
          <Polygon
            coordinates={gridPolygonCoords}
            strokeColor="#007AFF"
            fillColor="rgba(0, 122, 255, 0.2)"
            strokeWidth={2}
          />
        )}
      </MapViewComponent>

      <View style={styles.infoBox}>
        <Text>Zoom: {region.latitudeDelta.toFixed(5)}</Text>

        {markerCoordinate && (
          <>
            <Text>Lat: {markerCoordinate.latitude.toFixed(6)}</Text>
            <Text>Lon: {markerCoordinate.longitude.toFixed(6)}</Text>
          </>
        )}
      </View>
    </View>
  );
};

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoBox: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 8,
  },
  webMapPlaceholder: {
    width: "100%",
    backgroundColor: "#EEE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webMapText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  webCoordinateInfo: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
  },
});

export default MapView;