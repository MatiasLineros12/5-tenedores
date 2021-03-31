import React from 'react'
import MapView from 'react-native-maps'
import openMap from 'react-native-open-maps'
import { Platform } from "react-native"

export default function Map(props) {
    const {location, name, height} = props;

    const openAppMap = () => {
        /* curso udemy - solo se muestra bien e IOS 
        openMap({
            latitude: location.latitude,
            longitude: location.longitude,
            zoom: 19,
            query: name
        })
        */
        /* La siguiente función permite abrir mapa en ios y android */
        const datosCoords = Platform.select({
            ios: {
            latitude: location.latitude,
            longitude: location.longitude,
            zoom: 19,
            },
            android: {
            query: `${String(location.latitude)},${String(location.longitude)}`,
            zoom: 19,
            },
        });
        openMap(datosCoords);
    }

    return (
        <MapView
            style={{height: height, width: "100%"}}
            initialRegion={location}
            onPress={openAppMap}
        >
            <MapView.Marker
                coordinate={{latitude: location.latitude, longitude: location.longitude}}
            />
        </MapView>
    );
}
