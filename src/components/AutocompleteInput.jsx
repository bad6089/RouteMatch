import React, { useState, useCallback } from 'react';
import axios from 'axios';
import {
  Input,
  Box,
  List,
  ListItem,
  Spinner,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import debounce from 'lodash/debounce';

const AutocompleteInput = ({
  placeholder,
  value,
  onChange,
  onCoordinatesChange,
  rounded,
  width,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=pk.094e3f8616ad4cba24733e97845c8465&q=${input}&format=json`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    []
  );

  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    debouncedFetchSuggestions(inputValue);
    setShowSuggestions(true);
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion.display_name);
    onCoordinatesChange({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
  };

  return (
    <Box position='relative' width={width}>
      <InputGroup>
        <InputLeftElement pointerEvents='none' />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rounded={rounded}
          bg=''
          pl={10}
        />
      </InputGroup>
      {loading && <Spinner size='sm' />}
      {showSuggestions && suggestions.length > 0 && (
        <List
          zIndex='20'
          bg='white'
          border='1px solid #CBD5E0'
          borderRadius='md'
          mt='2'
          width='100%'
          position='relative'
          boxShadow='md'
        >
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              p='2'
              _hover={{ bg: 'gray.100' }}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AutocompleteInput;
