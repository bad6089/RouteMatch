import { Box } from '@chakra-ui/react';

const Layout = ({ children }) => {
  return (
    <Box bg='#f8f9fa'>
      <Box maxW='900px' mx='auto' p={2}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
