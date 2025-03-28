import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const SearchInput = ({ placeholder = "Search...", onSearch, className = '' }) => {
  return (
    <InputGroup className={className}>
      <InputGroup.Text className="bg-white border-end-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </InputGroup.Text>
      <Form.Control
        type="search"
        placeholder={placeholder}
        className="border-start-0 ps-0"
        onChange={(e) => onSearch(e.target.value)}
      />
    </InputGroup>
  );
};

export default SearchInput;
