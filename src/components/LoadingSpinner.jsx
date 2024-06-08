// src/components/LoadingSpinner.jsx
import React from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Flex justifyContent='center' my={4}>
      <Spinner size='xl' />
    </Flex>
  );
};

export default LoadingSpinner;
