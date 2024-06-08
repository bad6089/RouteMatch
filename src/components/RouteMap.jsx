import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { Box, Flex } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';

// A custom component to handle the map centering and zoom
const CenterMap = ({ route1, route2 }) => {
  const map = useMap();

  useEffect(() => {
    if (route1.length > 0 && route2.length > 0) {
      const bounds = [
        ...route1.map((coord) => [coord.lat, coord.lon]),
        ...route2.map((coord) => [coord.lat, coord.lon]),
      ];
      map.fitBounds(bounds);
    }
  }, [route1, route2, map]);

  return null;
};

const RouteMap = ({ route1, route2 }) => {
  return (
    <Flex justifyContent='center' mt={4}>
      <Box width='100%' height='400px' maxW='600px'>
        <MapContainer
          center={[route1[0]?.lat || 0, route1[0]?.lon || 0]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline
            positions={route1.map((coord) => [coord.lat, coord.lon])}
            color='rgba(0, 0, 255, 0.5)' // Blue with transparency
          />
          <Polyline
            positions={route2.map((coord) => [coord.lat, coord.lon])}
            color='rgba(255, 0, 0, 0.5)' // Red with transparency
          />
          <CenterMap route1={route1} route2={route2} />
        </MapContainer>
      </Box>
    </Flex>
  );
};

export default RouteMap;
