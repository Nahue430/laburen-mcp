--laburen-db
--Base de datos para prueba técnica de Laburen

--PRODUCTS
CREATE TABLE products (
  id INT PRIMARY KEY NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  size VARCHAR(10) NOT NULL,
  color VARCHAR(20) NOT NULL,
  stock INT NOT NULL,
  price_50_u INT NOT NULL,
  price_100_u INT NOT NULL,
  price_200_u INT NOT NULL,
  available VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL
)


--CARTS
CREATE TABLE carts (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL
)

--CART_ITEMS
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,

  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
