/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Fallback products — all unique images
const DEFAULT_PRODUCTS = [
  { name: "Smart Watch",        price: 7999,  image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop" },
  { name: "Wireless Headphones",price: 3499,  image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop" },
  { name: "Running Shoes",      price: 4999,  image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop" },
  { name: "Laptop",             price: 70000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop" },
  { name: "iPhone 14",          price: 69999, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop" },
  { name: "Bluetooth Speaker",  price: 2499,  image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop" },
  { name: "Gaming Chair",       price: 12999, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&auto=format&fit=crop" },
  { name: "Canon Camera",       price: 41999, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop" },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop";

function ProductImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);
  useEffect(() => { setImgSrc(src || FALLBACK_IMG); }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK_IMG)}
    />
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [search, setSearch] = useState("");

  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
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
              .then((d) => { if (Array.isArray(d)) setProducts(d); });
          }).catch(() => setProducts(DEFAULT_PRODUCTS));
        }
      })
      .catch(() => setProducts(DEFAULT_PRODUCTS));
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchCart = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/cart/${uid}`);
      setCart((await res.json()) || []);
    } catch (err) { console.log(err); }
  };

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter Email & Password");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        fetchCart(data.user.id);
        setPage("shop");
      } else alert(data.error || "Login Failed");
    } catch { alert("Backend not connected"); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) return alert("Enter Email & Password");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { alert("Account created! Please login."); setPage("login"); setEmail(""); setPassword(""); }
      else alert(data.error || "Register Failed");
    } catch { alert("Backend not connected"); }
    setLoading(false);
  };

  const handleLogout = () => {
    setUserId(null); setCart([]); setShowCart(false);
    setEmail(""); setPassword(""); setPage("login"); setShowAdmin(false); setUserEmail("");
  };

  const addToCart = async (product) => {
    try {
      await fetch(`${API_URL}/cart`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      setShowPopup("✅ Added to cart!");
      setTimeout(() => setShowPopup(""), 2000);
      fetchCart(userId);
    } catch (err) { console.log(err); }
  };

  const removeFromCart = async (productId) => {
    try {
      await fetch(`${API_URL}/cart/${userId}/${productId}`, { method: "DELETE" });
      fetchCart(userId);
    } catch (err) { console.log(err); }
  };

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
      setTimeout(() => setShowPopup(""), 2000);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // ── AUTH PAGE ──────────────────────────────────────────────────────────────
  if (page === "login" || page === "register") {
    const isLogin = page === "login";
    return (
      <div className="auth-bg">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-brand-icon">🛍️</span>
            <h1>EShop</h1>
            <p>Your one-stop destination for everything you need</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature"><span>🚀</span> Fast Delivery</div>
            <div className="auth-feature"><span>🔒</span> Secure Payments</div>
            <div className="auth-feature"><span>💎</span> Premium Products</div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2>{isLogin ? "Welcome Back 👋" : "Create Account 🎉"}</h2>
            <p className="auth-sub">{isLogin ? "Sign in to continue shopping" : "Join thousands of happy shoppers"}</p>

            <div className="auth-field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="auth-input" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                className="auth-input" />
            </div>

            <button onClick={isLogin ? handleLogin : handleRegister}
              className="auth-btn" disabled={loading}>
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </button>

            <p className="auth-switch">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => { setPage(isLogin ? "register" : "login"); setEmail(""); setPassword(""); }}>
                {isLogin ? "Register" : "Sign In"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── SHOP PAGE ──────────────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* TOAST */}
      {showPopup && <div className="toast">{showPopup}</div>}

      {/* ORDER SUCCESS */}
      {orderDone && (
        <div className="overlay">
          <div className="order-success">
            <div className="success-icon">🎉</div>
            <h2>Order Placed!</h2>
            <p>Thank you for your purchase. We'll deliver it soon!</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">EShop</span>
        </div>

        <div className="header-search">
          {!showCart && !showAdmin && (
            <>
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="header-search-input"
              />
              {search && <span className="search-clear" onClick={() => setSearch("")}>✕</span>}
            </>
          )}
        </div>

        <div className="header-right">
          <button className={`nav-btn ${showCart ? "active-red" : "cart-btn"}`}
            onClick={() => { setShowAdmin(false); setShowCart(!showCart); if (!showCart) fetchCart(userId); }}>
            {showCart ? "← Shop" : (
              <span className="cart-label">
                🛒 Cart
                {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </span>
            )}
          </button>
          <button className={`nav-btn ${showAdmin ? "active-orange" : "admin-btn"}`}
            onClick={() => { setShowCart(false); setShowAdmin(!showAdmin); }}>
            {showAdmin ? "← Shop" : "⚙️ Admin"}
          </button>
          <div className="user-menu">
            <span className="user-avatar">{userEmail ? userEmail[0].toUpperCase() : "U"}</span>
            <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── ADMIN PANEL ── */}
      {showAdmin && (
        <div className="page-container">
          <div className="page-header">
            <h2>⚙️ Manage Products</h2>
            <span className="product-count">{products.length} products</span>
          </div>

          <div className="admin-form-card">
            <h3>{editProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
            <div className="admin-form-grid">
              <input placeholder="Product Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
              <input placeholder="Price (₹)" type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} className="form-input" />
              <input placeholder="Image URL (optional)" value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="form-input form-input-full" />
            </div>
            <div className="form-actions">
              <button onClick={handleSaveProduct} className={`form-btn ${editProduct ? "btn-orange" : "btn-green"}`}>
                {editProduct ? "Update Product" : "Add Product"}
              </button>
              {editProduct && (
                <button onClick={() => { setEditProduct(null); setForm({ name: "", price: "", image: "" }); }}
                  className="form-btn btn-gray">Cancel</button>
              )}
            </div>
          </div>

          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-img-wrap">
                  <ProductImage src={p.image} alt={p.name} className="product-img" />
                </div>
                <div className="product-info">
                  <h4 className="product-name">{p.name}</h4>
                  <p className="product-price">₹{Number(p.price).toLocaleString()}</p>
                  <div className="admin-actions">
                    <button onClick={() => startEdit(p)} className="action-btn btn-blue">✏️ Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="action-btn btn-red">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SHOP GRID ── */}
      {!showCart && !showAdmin && (
        <div className="page-container">
          <div className="shop-hero">
            <div className="hero-tag">✨ New Arrivals</div>
            <h2>Discover Amazing Products</h2>
            <p>Shop the latest tech, fashion, and lifestyle products — all in one place</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">{products.length}+</div>
                <div className="hero-stat-label">Products</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">FREE</div>
                <div className="hero-stat-label">Delivery</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">24/7</div>
                <div className="hero-stat-label">Support</div>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>{search ? `No results for "${search}"` : "Go to Admin to add products!"}</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card shop-card">
                  <div className="product-img-wrap">
                    <ProductImage src={product.image} alt={product.name} className="product-img" />
                    <span className="price-badge">₹{Number(product.price).toLocaleString()}</span>
                    <div className="product-overlay">
                      <button onClick={() => addToCart(product)} className="quick-add-btn">
                        + Quick Add
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-footer">
                      <span className="product-price">₹{Number(product.price).toLocaleString()}</span>
                      <button onClick={() => addToCart(product)} className="add-cart-btn">
                        🛒 Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CART ── */}
      {showCart && (
        <div className="page-container cart-container">
          <div className="page-header">
            <h2>🛒 Your Cart</h2>
            {cart.length > 0 && <span className="product-count">{cart.length} items</span>}
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some products to get started!</p>
              <button onClick={() => setShowCart(false)} className="auth-btn" style={{ marginTop: "16px", width: "auto", padding: "12px 32px" }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.product_id} className="cart-item">
                    <ProductImage src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">₹{Number(item.price).toLocaleString()} × {item.quantity}</p>
                      <p className="cart-item-subtotal">Subtotal: ₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="remove-btn">✕</button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Order Summary</h3>
                <div className="summary-row"><span>Items ({cart.length})</span><span>₹{totalAmount.toLocaleString()}</span></div>
                <div className="summary-row"><span>Delivery</span><span className="free-tag">FREE</span></div>
                <div className="summary-divider" />
                <div className="summary-total"><span>Total</span><span>₹{totalAmount.toLocaleString()}</span></div>
                <button onClick={() => setShowQR(true)} className="checkout-btn">
                  💳 Proceed to Pay
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QR PAYMENT ── */}
      {showQR && (
        <div className="overlay" onClick={(e) => e.target.className === "overlay" && setShowQR(false)}>
          <div className="qr-modal">
            <button className="modal-close" onClick={() => setShowQR(false)}>✕</button>
            <h2>Scan & Pay</h2>
            <p className="qr-amount">₹{totalAmount.toLocaleString()}</p>
            <div className="qr-wrap">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?am=${totalAmount}&cu=INR`}
                alt="QR Code"
                className="qr-img"
              />
            </div>
            <p className="qr-apps">PhonePe · Google Pay · Paytm</p>
            <div className="qr-actions">
              <button onClick={handleCheckout} className="form-btn btn-green">✅ I've Paid</button>
              <button onClick={() => setShowQR(false)} className="form-btn btn-gray">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">🛍️ EShop</span>
            <p>Your one-stop destination for premium products. Fast delivery, secure payments, and 24/7 support.</p>
            <div className="footer-socials">
              <a href="#" className="social-btn">𝕏</a>
              <a href="#" className="social-btn">in</a>
              <a href="#" className="social-btn">f</a>
              <a href="#" className="social-btn">▶</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <a href="#">All Products</a>
            <a href="#">Electronics</a>
            <a href="#">Fashion</a>
            <a href="#">Home & Kitchen</a>
            <a href="#">Sports & Fitness</a>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Track Order</a>
            <a href="#">Returns & Refunds</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQs</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Blog</a>
          </div>
        </div>

        <div className="footer-badges">
          <div className="footer-badge"><span>🚀</span> Free Delivery</div>
          <div className="footer-badge"><span>🔒</span> Secure Payments</div>
          <div className="footer-badge"><span>↩️</span> Easy Returns</div>
          <div className="footer-badge"><span>🎧</span> 24/7 Support</div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EShop. All rights reserved. Made with ❤️ in India.</p>
          <div className="footer-pay-icons">
            <span className="pay-icon">VISA</span>
            <span className="pay-icon">MC</span>
            <span className="pay-icon">UPI</span>
            <span className="pay-icon">GPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
