// CustomButton.js
import React from 'react';
import { Button } from '@chakra-ui/react';

const CustomButton = ({ children, ...props }) => {
  return (
    <Button
      borderRadius='full'
      bg='#150035'
      color='#FFFFFF'
      _hover={{ bg: '#150C5F', color: '#FFFFFF' }}
      _active={{ bg: '#352E72', color: '#FFFFFF' }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
