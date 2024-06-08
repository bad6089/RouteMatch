// src/components/TestForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Text,
  useToast,
  HStack,
  Flex,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import AutocompleteInput from './AutocompleteInput';
import RouteMap from './RouteMap';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import * as turf from '@turf/turf';

const TestForm = () => {
  const [originA, setOriginA] = useState('');
  const [destinationA, setDestinationA] = useState('');
  const [originB, setOriginB] = useState('');
  const [destinationB, setDestinationB] = useState('');
  const [coords, setCoords] = useState({
    originA: null,
    destinationA: null,
    originB: null,
    destinationB: null,
  });
  const [route1Coords, setRoute1Coords] = useState([]);
  const [route2Coords, setRoute2Coords] = useState([]);
  const [overlapPercentage, setOverlapPercentage] = useState(null);
  const [mergeLocation, setMergeLocation] = useState('');
  const [divergeLocation, setDivergeLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCoordinatesChange = (location, coordinates) => {
    setCoords((prevCoords) => ({
      ...prevCoords,
      [location]: coordinates,
    }));
  };

  const fetchRoute = async (origin, destination) => {
    const API_KEY = '5b3ce3597851110001cf62480304dcb7daa64233827bfabd3fb99cac';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${origin.lon},${origin.lat}&end=${destination.lon},${destination.lat}`;

    try {
      const response = await axios.get(url);
      return response.data.features[0].geometry.coordinates.map((coord) => ({
        lon: coord[0],
        lat: coord[1],
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch route data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    }
  };

  const calculateOverlap = (route1, route2) => {
    const overlapPoints = route1.filter((point1) =>
      route2.some(
        (point2) => point1.lat === point2.lat && point1.lon === point2.lon
      )
    );
    const overlap =
      (overlapPoints.length / Math.min(route1.length, route2.length)) * 100;
    return overlap.toFixed(2);
  };

  const reverseGeocode = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
      const response = await axios.get(url);
      return response.data.display_name;
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
      return 'Unknown location';
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!originA || !destinationA || !originB || !destinationB) {
      toast({
        title: 'Error',
        description: 'Please complete all the fields before submitting.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (
      !coords.originA ||
      !coords.destinationA ||
      !coords.originB ||
      !coords.destinationB
    ) {
      toast({
        title: 'Error',
        description: 'Please select valid locations from the suggestions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const route1 = await fetchRoute(coords.originA, coords.destinationA);
      const route2 = await fetchRoute(coords.originB, coords.destinationB);

      if (route1.length > 0 && route2.length > 0) {
        setRoute1Coords(route1);
        setRoute2Coords(route2);
        const overlap = calculateOverlap(route1, route2);
        setOverlapPercentage(overlap);

        // Calculate intersections
        const line1 = turf.lineString(
          route1.map((point) => [point.lon, point.lat])
        );
        const line2 = turf.lineString(
          route2.map((point) => [point.lon, point.lat])
        );
        const intersections = turf.lineIntersect(line1, line2);

        if (intersections.features.length > 0) {
          // Get the first and last intersection points
          const firstIntersection = intersections.features[0];
          const lastIntersection =
            intersections.features[intersections.features.length - 1];

          // Reverse geocode these points
          const mergeLocation = await reverseGeocode(
            firstIntersection.geometry.coordinates[1],
            firstIntersection.geometry.coordinates[0]
          );
          const divergeLocation = await reverseGeocode(
            lastIntersection.geometry.coordinates[1],
            lastIntersection.geometry.coordinates[0]
          );

          setMergeLocation(mergeLocation);
          setDivergeLocation(divergeLocation);
        }

        toast({
          title: 'Success',
          description:
            'Routes fetched, overlap calculated, and intersections identified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while processing the routes.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg='white'
      p={6}
      mt={-1}
      rounded='md'
      width='100%'
      mx='auto'
      boxShadow='xs'
    >
      <form onSubmit={handleFormSubmit}>
        <Text
          fontSize='xl'
          mb={4}
          textAlign='center'
          color='#150035'
          fontWeight='bold'
        >
          Compare Routes
        </Text>

        <Text
          fontSize='lg'
          mb={4}
          textAlign='left'
          color='blue.500'
          fontWeight='bold'
        >
          Route 1
        </Text>
        <FormControl mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FontAwesomeIcon icon={faGlobe} color='#CBD5E0' />
            </InputLeftElement>
            <AutocompleteInput
              placeholder='Origin A'
              value={originA}
              onChange={setOriginA}
              onCoordinatesChange={(coords) =>
                handleCoordinatesChange('originA', coords)
              }
              rounded='full'
              width='100%'
            />
          </InputGroup>
        </FormControl>
        <FormControl mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FontAwesomeIcon icon={faMapMarker} color='#CBD5E0' />
            </InputLeftElement>
            <AutocompleteInput
              placeholder='Destination A'
              value={destinationA}
              onChange={setDestinationA}
              onCoordinatesChange={(coords) =>
                handleCoordinatesChange('destinationA', coords)
              }
              rounded='full'
              width='100%'
            />
          </InputGroup>
        </FormControl>

        <Text
          fontSize='lg'
          mb={4}
          textAlign='left'
          color='red.500'
          fontWeight='bold'
        >
          Route 2
        </Text>
        <FormControl mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FontAwesomeIcon icon={faGlobe} color='#CBD5E0' />
            </InputLeftElement>
            <AutocompleteInput
              placeholder='Origin B'
              value={originB}
              onChange={setOriginB}
              onCoordinatesChange={(coords) =>
                handleCoordinatesChange('originB', coords)
              }
              rounded='full'
              width='100%'
            />
          </InputGroup>
        </FormControl>
        <FormControl mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FontAwesomeIcon icon={faMapMarker} color='#CBD5E0' />
            </InputLeftElement>
            <AutocompleteInput
              placeholder='Destination B'
              value={destinationB}
              onChange={setDestinationB}
              onCoordinatesChange={(coords) =>
                handleCoordinatesChange('destinationB', coords)
              }
              rounded='full'
              width='100%'
            />
          </InputGroup>
        </FormControl>

        <Flex
          alignItems='center'
          justifyContent='space-between'
          mb={4}
          flexWrap='wrap'
        >
          <HStack mb={[2, 0]} justify='space-between' w='100%'>
            <Button type='submit' rounded='full'>
              Submit
            </Button>
          </HStack>
        </Flex>

        {loading && <LoadingSpinner />}

        {route1Coords.length > 0 && route2Coords.length > 0 && !loading && (
          <Box>
            <RouteMap route1={route1Coords} route2={route2Coords} />
            <Text mt={4}>Overlap Percentage: {overlapPercentage}%</Text>
            <Text mt={4}>Entry Intersection: {mergeLocation}</Text>
            <Text mt={4}>Exit Intersection: {divergeLocation}</Text>
          </Box>
        )}
      </form>
    </Box>
  );
};

export default TestForm;
