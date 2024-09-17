#!/bin/bash

# Connect to the SQLite database (or create if it doesn't exist)
sqlite3 products.db <<EOF

-- Enable JSON1 extension (if not already enabled)
SELECT json_valid('{}');

-- Create a table to store JSON data
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  data JSONB
);

-- Insert some sample data (using JSONB format)
INSERT INTO products (data) VALUES
  (jsonb('{"name": "Product A", "description": "This is a great product.", "tags": ["electronics", "gadget"]}')),
  (jsonb('{"name": "Product B", "description": "Another amazing product.", "tags": ["books", "fiction"]}')),
  (jsonb('{"name": "Product C", "description": "A fantastic product for everyone.", "tags": ["tools", "hardware"]}'));


SELECT json(data) FROM products;
SELECT json_extract(data,'$') FROM products;
SELECT json_extract(data,'$.name') FROM products;
SELECT json_extract(data,'$.tags') FROM products;

-- Query for products with specific tags (using JSON functions)
SELECT json(data) FROM products WHERE data->>'name' == 'Product A';
SELECT json(data) FROM products WHERE EXISTS (SELECT 1 FROM json_each(data, '$.tags') WHERE value = 'books');
SELECT json(data) FROM products WHERE EXISTS (SELECT 1 FROM json_each(data, '$.tags') WHERE value = 'tools');
EOF