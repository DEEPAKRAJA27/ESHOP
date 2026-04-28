const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= TEST API ================= */
app.get("/api/message", (req, res) => {
  res.json({ message: "Backend + PostgreSQL Connected 🚀" });
});

/* ================= GET ALL PRODUCTS ================= */
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

/* ================= REGISTER USER ================= */
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0)
      return res.status(409).json({ error: "User already exists" });

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

/* ================= LOGIN USER ================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful", user: result.rows[0] });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ================= ADD TO CART ================= */
app.post("/api/cart", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2 RETURNING *",
        [user_id, product_id]
      );
      return res.status(200).json(updated.rows[0]);
    }

    const result = await pool.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [user_id, product_id, quantity || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Cart Error:", error);
    res.status(500).json({ error: "Error adding to cart" });
  }
});

/* ================= GET USER CART ================= */
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT cart.id, cart.product_id, cart.quantity, products.name, products.price, products.image
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Fetch Cart Error:", error);
    res.status(500).json({ error: "Error fetching cart" });
  }
});

/* ================= REMOVE FROM CART ================= */
app.delete("/api/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [userId, productId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Item not found in cart" });

    res.json({ message: "Item removed", deleted: result.rows[0] });
  } catch (error) {
    console.error("❌ Delete Cart Error:", error);
    res.status(500).json({ error: "Error removing cart item" });
  }
});

/* ================= CREATE ORDER + CLEAR CART ================= */
app.post("/api/orders", async (req, res) => {
  const { user_id, total_price } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *",
      [user_id, total_price]
    );

    await pool.query("DELETE FROM cart WHERE user_id = $1", [user_id]);

    res.status(201).json({ message: "Order placed successfully", order: result.rows[0] });
  } catch (error) {
    console.error("❌ Order Error:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

/* ================= ADD PRODUCT ================= */
app.post("/api/products", async (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, image) VALUES ($1, $2, $3) RETURNING *",
      [name, price, image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error adding product" });
  }
});

/* ================= EDIT PRODUCT ================= */
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2, image=$3 WHERE id=$4 RETURNING *",
      [name, price, image, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
});

/* ================= DELETE PRODUCT ================= */
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM cart WHERE product_id = $1", [id]);
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

/* ================= START SERVER ================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
