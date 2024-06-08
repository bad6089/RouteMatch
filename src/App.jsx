import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import Layout from './components/Layout';
import TestForm from './components/TestForm';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <TestForm />
      </Layout>
    </ChakraProvider>
  );
}

export default App;
