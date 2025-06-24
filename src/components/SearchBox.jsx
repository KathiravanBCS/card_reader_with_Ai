import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';

const SearchBox = ({ value, onChange, placeholder }) => (
  <Row className="mb-3 mt-4">
    <Col md={6} className="mx-auto">
      <Form.Control
        type="text"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={onChange}
        style={{ boxShadow: '0 1px 4px #eee', fontSize: 15 }}
      />
    </Col>
  </Row>
);

export default SearchBox;
