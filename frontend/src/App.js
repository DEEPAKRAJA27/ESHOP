import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

const DEFAULT_PRODUCTS = [
  { name: "Smart Watch", price: 7999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
  { name: "Wireless Headphones", price: 3499, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
  { name: "Running Shoes", price: 4999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { name: "Laptop", price: 70000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" },
  { name: "iPhone 14", price: 69999, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800" },
  { name: "Bluetooth Speaker", price: 2499, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800" },
  { name: "Gaming Chair", price: 12999, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800" },
  { name: "Canon Camera", price: 41999, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
];

function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  // Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "" });

  // ================= FETCH PRODUCTS =================
  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          // seed default products if DB is empty
          Promise.all(
            DEFAULT_PRODUCTS.map((p) =>
              fetch(`${API_URL}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(p),
              })
            )
          ).then(() => {
            fetch(`${API_URL}/products`)
              .then((r) => r.json())
              .then((d) => setProducts(d));
          });
        }
      })
      .catch(console.log);
  };

  useEffect(() => { fetchProducts(); }, []);

  // ================= FETCH CART =================
  const fetchCart = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/cart/${uid}`);
      setCart((await res.json()) || []);
    } catch (err) { console.log(err); }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) return alert("Enter Email & Password");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { setUserId(data.user.id); fetchCart(data.user.id); setPage("shop"); }
      else alert(data.error || "Login Failed");
    } catch { alert("Backend not connected"); }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    if (!email || !password) return alert("Enter Email & Password");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { alert("Account created! Please login."); setPage("login"); setEmail(""); setPassword(""); }
      else alert(data.error || "Register Failed");
    } catch { alert("Backend not connected"); }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    setUserId(null); setCart([]); setShowCart(false);
    setEmail(""); setPassword(""); setPage("login"); setShowAdmin(false);
  };

  // ================= CART =================
  const addToCart = async (product) => {
    try {
      await fetch(`${API_URL}/cart`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      setShowPopup("✅ Added to cart!"); setTimeout(() => setShowPopup(""), 1500);
      fetchCart(userId);
    } catch (err) { console.log(err); }
  };

  const removeFromCart = async (productId) => {
    try {
      await fetch(`${API_URL}/cart/${userId}/${productId}`, { method: "DELETE" });
      fetchCart(userId);
    } catch (err) { console.log(err); }
  };

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    try {
      await fetch(`${API_URL}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, total_price: totalAmount }),
      });
      setCart([]); setShowQR(false); setOrderDone(true);
      setTimeout(() => { setOrderDone(false); setShowCart(false); }, 3000);
    } catch (err) { console.log(err); }
  };

  // ================= ADMIN =================
  const handleSaveProduct = async () => {
    if (!form.name || !form.price) return alert("Name and price required");
    const method = editProduct ? "PUT" : "POST";
    const url = editProduct ? `${API_URL}/products/${editProduct.id}` : `${API_URL}/products`;
    try {
      await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, price: Number(form.price), image: form.image }),
      });
      setForm({ name: "", price: "", image: "" }); setEditProduct(null);
      fetchProducts();
      setShowPopup(editProduct ? "✅ Product updated!" : "✅ Product added!");
      setTimeout(() => setShowPopup(""), 1500);
    } catch (err) { console.log(err); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) { console.log(err); }
  };

  const startEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, image: p.image || "" });
  };

  const [search, setSearch] = useState("");

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // ================= AUTH PAGE =================
  if (page === "login" || page === "register") {
    const isLogin = page === "login";
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: "10px", fontSize: "40px" }}>🛍️</div>
          <h2 style={{ textAlign: "center", margin: "0 0 20px", color: "#333" }}>{isLogin ? "Welcome Back" : "Create Account"}</h2>

          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />

          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
            style={{ width: "100%", padding: "12px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />

          <button onClick={isLogin ? handleLogin : handleRegister}
            style={{ width: "100%", marginTop: "16px", padding: "13px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
            {isLogin ? "Login" : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
            {isLogin ? "No account? " : "Already have an account? "}
            <span onClick={() => { setPage(isLogin ? "register" : "login"); setEmail(""); setPassword(""); }}
              style={{ color: "#667eea", cursor: "pointer", fontWeight: "bold" }}>
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ================= SHOP PAGE =================
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>

      {/* TOAST POPUP */}
      {showPopup && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#2ecc71", color: "white", padding: "14px 24px", borderRadius: "10px", zIndex: 9999, fontWeight: "bold", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {showPopup}
        </div>
      )}

      {/* ORDER DONE */}
      {orderDone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "50px", borderRadius: "16px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "60px" }}>🎉</div>
            <h2 style={{ color: "#2ecc71", margin: "10px 0" }}>Order Placed!</h2>
            <p style={{ color: "#666" }}>Thank you for your purchase.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "linear-gradient(90deg,#1a1a2e,#16213e,#0f3460)", color: "white", padding: "16px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <h1 style={{ margin: 0, fontSize: "24px", letterSpacing: "1px" }}>🛍️ EShop</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setShowAdmin(false); setShowCart(!showCart); if (!showCart) fetchCart(userId); }}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", cursor: "pointer", background: showCart ? "#e74c3c" : "white", color: showCart ? "white" : "#333", fontWeight: "bold" }}>
            {showCart ? "← Shop" : `🛒 Cart (${cart.length})`}
          </button>
          <button onClick={() => { setShowCart(false); setShowAdmin(!showAdmin); }}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", cursor: "pointer", background: showAdmin ? "#f39c12" : "#3498db", color: "white", fontWeight: "bold" }}>
            {showAdmin ? "← Shop" : "⚙️ Admin"}
          </button>
          <button onClick={handleLogout}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", cursor: "pointer", background: "#e74c3c", color: "white", fontWeight: "bold" }}>
            Logout
          </button>
        </div>
      </header>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "20px" }}>⚙️ Admin — Manage Products</h2>

          {/* FORM */}
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 16px" }}>{editProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
              <input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
              <input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", gridColumn: "1 / -1" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={handleSaveProduct}
                style={{ padding: "10px 24px", background: editProduct ? "#f39c12" : "#2ecc71", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {editProduct ? "Update Product" : "Add Product"}
              </button>
              {editProduct && (
                <button onClick={() => { setEditProduct(null); setForm({ name: "", price: "", image: "" }); }}
                  style={{ padding: "10px 24px", background: "#ccc", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "16px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                <div style={{ padding: "12px" }}>
                  <h4 style={{ margin: "0 0 4px" }}>{p.name}</h4>
                  <p style={{ margin: "0 0 12px", color: "#e74c3c", fontWeight: "bold" }}>₹{p.price}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => startEdit(p)}
                      style={{ flex: 1, padding: "8px", background: "#3498db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)}
                      style={{ flex: 1, padding: "8px", background: "#e74c3c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {!showCart && !showAdmin && (
        <div style={{ padding: "30px" }}>
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", background: "white", borderRadius: "10px", padding: "10px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <span style={{ fontSize: "18px", marginRight: "10px" }}>🔍</span>
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "16px", width: "100%", background: "transparent" }}
            />
            {search && <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "#999", fontSize: "18px" }}>✕</span>}
          </div>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>🔥 Featured Products</h2>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>
              <div style={{ fontSize: "50px" }}>📦</div>
              <p>No products yet. Go to Admin to add some!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "24px" }}>
              {filteredProducts.map((product) => (
                <div key={product.id} style={{ background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", cursor: "default" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ position: "relative" }}>
                    <img src={product.image} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#222" }}>{product.name}</h3>
                    <p style={{ margin: "0 0 14px", fontSize: "20px", fontWeight: "bold", color: "#e74c3c" }}>₹{Number(product.price).toLocaleString()}</p>
                    <button onClick={() => addToCart(product)}
                      style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CART */}
      {showCart && (
        <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "20px" }}>🛒 Your Cart</h2>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" }}>
              <div style={{ fontSize: "50px" }}>🛒</div>
              <p style={{ color: "#999" }}>Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "16px", marginBottom: "12px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <img src={item.image} alt={item.name} style={{ width: "75px", height: "75px", objectFit: "cover", borderRadius: "8px" }} />
                    <div>
                      <h4 style={{ margin: "0 0 4px" }}>{item.name}</h4>
                      <p style={{ margin: 0, color: "#e74c3c", fontWeight: "bold" }}>₹{Number(item.price).toLocaleString()} × {item.quantity}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id)}
                    style={{ background: "#e74c3c", color: "white", border: "none", padding: "9px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                    Remove
                  </button>
                </div>
              ))}
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginTop: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <h2 style={{ margin: "0 0 16px" }}>Total: ₹{totalAmount.toLocaleString()}</h2>
                <button onClick={() => setShowQR(true)}
                  style={{ padding: "13px 35px", background: "linear-gradient(135deg,#2ecc71,#27ae60)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
                  💳 Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* QR PAYMENT */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ marginBottom: "5px" }}>Scan to Pay</h2>
            <p style={{ color: "#e74c3c", fontSize: "22px", fontWeight: "bold", margin: "0 0 20px" }}>₹{totalAmount.toLocaleString()}</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?am=${totalAmount}`} alt="QR" style={{ borderRadius: "8px" }} />
            <p style={{ color: "#666", marginTop: "10px" }}>PhonePe / Google Pay / Paytm</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button onClick={handleCheckout}
                style={{ padding: "11px 28px", background: "#2ecc71", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                ✅ I've Paid
              </button>
              <button onClick={() => setShowQR(false)}
                style={{ padding: "11px 28px", background: "#ccc", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
