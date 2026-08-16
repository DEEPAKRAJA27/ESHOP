/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || "";
const FIREBASE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID || "";
const FIREBASE_APP_ID = process.env.REACT_APP_FIREBASE_APP_ID || "";

// Fallback products
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Smart Watch",         price: 7999,  category: "Electronics", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop" },
  { id: 2, name: "Wireless Headphones", price: 3499,  category: "Electronics", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop" },
  { id: 3, name: "Running Shoes",       price: 4999,  category: "Fashion",     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop" },
  { id: 4, name: "Laptop",             price: 70000, category: "Electronics", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop" },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop";

const CATEGORIES = ["All", "Electronics", "Fashion", "Grocery", "Home & Kitchen", "Beauty"];

function ProductImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);
  useEffect(() => { setImgSrc(src || FALLBACK_IMG); }, [src]);
  return <img src={imgSrc} alt={alt} className={className} onError={() => setImgSrc(FALLBACK_IMG)} />;
}

function StarRating({ rating = 4.2, count = 128 }) {
  const stars = Math.round(rating);
  return (
    <div className="star-row">
      <span className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
      <span className="rating-count">({count})</span>
    </div>
  );
}

// ─── Firebase Google Sign-In ─────────────────────────────────────────────────
async function signInWithGoogle() {
  // Load Firebase JS SDK dynamically
  if (!window.firebase) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  if (!window.firebase.apps?.length) {
    window.firebase.initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: FIREBASE_PROJECT_ID,
      appId: FIREBASE_APP_ID,
    });
  }
  const provider = new window.firebase.auth.GoogleAuthProvider();
  const result = await window.firebase.auth().signInWithPopup(provider);
  const idToken = await result.user.getIdToken();
  return idToken;
}

function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "", category: "Electronics", stock: "" });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { if (Array.isArray(data) && data.length > 0) setProducts(data); else setProducts(DEFAULT_PRODUCTS); })
      .catch(() => setProducts(DEFAULT_PRODUCTS));
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchCart = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/cart/${uid}`);
      setCart((await res.json()) || []);
    } catch (err) { console.log(err); }
  };

  const loginSuccess = (data) => {
    setUserId(data.user.id);
    setUserName(data.user.name || data.user.email?.split("@")[0]);
    fetchCart(data.user.id);
    setPage("shop");
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
      if (res.ok) loginSuccess(data);
      else alert(data.error || "Login Failed");
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

  const handleGoogleLogin = async () => {
    if (!FIREBASE_API_KEY) return alert("Firebase is not configured. Add REACT_APP_FIREBASE_API_KEY to Vercel environment variables.");
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok) loginSuccess(data);
      else alert(data.error || "Google login failed");
    } catch (err) { alert("Google sign-in failed: " + err.message); }
    setGoogleLoading(false);
  };

  const handleLogout = () => {
    setUserId(null); setCart([]); setShowCart(false); setShowAdmin(false);
    setEmail(""); setPassword(""); setPage("login"); setUserName("");
    if (window.firebase?.auth) window.firebase.auth().signOut().catch(() => {});
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
        body: JSON.stringify({ name: form.name, price: Number(form.price), image: form.image, description: form.description, category: form.category, stock: Number(form.stock) || 0 }),
      });
      setForm({ name: "", price: "", image: "", description: "", category: "Electronics", stock: "" });
      setEditProduct(null);
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
    setForm({ name: p.name, price: p.price, image: p.image || "", description: p.description || "", category: p.category || "Electronics", stock: p.stock || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // ── AUTH PAGE ──────────────────────────────────────────────────────────────
  if (page === "login" || page === "register") {
    const isLogin = page === "login";
    return (
      <div className="auth-bg">
        <div className="auth-left">
          <div className="auth-brand-block">
            <div className="auth-logo">🛍️</div>
            <h1 className="auth-brand-name">EShop</h1>
            <p className="auth-brand-tagline">India's favourite online shopping destination</p>
          </div>
          <div className="auth-perks">
            <div className="auth-perk"><span className="perk-icon">🚚</span><div><strong>Free Delivery</strong><small>On orders above ₹499</small></div></div>
            <div className="auth-perk"><span className="perk-icon">🔒</span><div><strong>Secure Payments</strong><small>100% safe & encrypted</small></div></div>
            <div className="auth-perk"><span className="perk-icon">↩️</span><div><strong>Easy Returns</strong><small>30-day return policy</small></div></div>
            <div className="auth-perk"><span className="perk-icon">⭐</span><div><strong>Top Brands</strong><small>Authentic products only</small></div></div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">{isLogin ? "Sign In" : "Create Account"}</h2>
            <p className="auth-sub">{isLogin ? "Welcome back! Please enter your details." : "Join millions of happy shoppers."}</p>

            {/* Google Login Button */}
            <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
              <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" id="auth-email" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                className="auth-input" id="auth-password" />
            </div>

            <button onClick={isLogin ? handleLogin : handleRegister} className="auth-btn" disabled={loading} id="auth-submit-btn">
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </button>

            <p className="auth-switch">
              {isLogin ? "New to EShop? " : "Already have an account? "}
              <span onClick={() => { setPage(isLogin ? "register" : "login"); setEmail(""); setPassword(""); }}>
                {isLogin ? "Create account" : "Sign in"}
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

      {/* ORDER SUCCESS OVERLAY */}
      {orderDone && (
        <div className="overlay">
          <div className="order-success">
            <div className="success-anim">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you! Your order is confirmed and will be delivered soon.</p>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => { setShowCart(false); setShowAdmin(false); }}>
            <span className="navbar-logo">🛍️</span>
            <span className="navbar-name">EShop</span>
          </div>

          <div className="navbar-search-wrap">
            <input
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search"
              id="navbar-search"
            />
            <button className="navbar-search-btn">🔍</button>
          </div>

          <div className="navbar-actions">
            <button
              id="cart-btn"
              className={`navbar-icon-btn ${showCart ? "active" : ""}`}
              onClick={() => { setShowAdmin(false); setShowCart(!showCart); if (!showCart) fetchCart(userId); }}
            >
              <span className="icon-wrap">
                🛒
                {cart.length > 0 && <span className="badge">{cart.length}</span>}
              </span>
              <span className="icon-label">Cart</span>
            </button>

            <button
              id="admin-btn"
              className={`navbar-icon-btn ${showAdmin ? "active" : ""}`}
              onClick={() => { setShowCart(false); setShowAdmin(!showAdmin); }}
            >
              <span className="icon-wrap">⚙️</span>
              <span className="icon-label">Manage</span>
            </button>

            <div className="navbar-user">
              <div className="user-avatar-circle">{userName ? userName[0].toUpperCase() : "U"}</div>
              <div className="user-info-wrap">
                <span className="user-greeting">Hello, {userName || "User"}</span>
                <button className="logout-link" onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        {!showCart && !showAdmin && (
          <div className="category-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" && "🏠 "}
                {cat === "Electronics" && "📱 "}
                {cat === "Fashion" && "👗 "}
                {cat === "Grocery" && "🛒 "}
                {cat === "Home & Kitchen" && "🍳 "}
                {cat === "Beauty" && "💄 "}
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── ADMIN PANEL ── */}
      {showAdmin && (
        <div className="page-wrap">
          <div className="section-header">
            <h2>⚙️ Manage Products</h2>
            <span className="count-pill">{products.length} products</span>
          </div>

          <div className="admin-form-card">
            <h3>{editProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
            <div className="admin-form-grid">
              <input placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
              <input placeholder="Price (₹) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="form-input" />
              <input placeholder="Stock Quantity" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="form-input" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-input">
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="form-input form-input-full" />
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input form-input-full form-textarea" rows={2} />
            </div>
            <div className="form-actions">
              <button onClick={handleSaveProduct} className={`form-btn ${editProduct ? "btn-orange" : "btn-green"}`}>
                {editProduct ? "Update Product" : "Add Product"}
              </button>
              {editProduct && <button onClick={() => { setEditProduct(null); setForm({ name: "", price: "", image: "", description: "", category: "Electronics", stock: "" }); }} className="form-btn btn-gray">Cancel</button>}
            </div>
          </div>

          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-img-wrap">
                  <ProductImage src={p.image} alt={p.name} className="product-img" />
                </div>
                <div className="product-info">
                  <span className="product-category-tag">{p.category}</span>
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

      {/* ── PRODUCT GRID ── */}
      {!showCart && !showAdmin && (
        <div className="page-wrap">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>{search ? `No results for "${search}"` : "No products in this category yet."}</p>
            </div>
          ) : (
            <>
              <div className="results-bar">
                <span>{filteredProducts.length} products{activeCategory !== "All" ? ` in ${activeCategory}` : ""}</span>
              </div>
              <div className="products-grid">
                {filteredProducts.map((product) => {
                  const discount = Math.floor(Math.random() * 30) + 5;
                  const originalPrice = Math.round(Number(product.price) / (1 - discount / 100));
                  const rating = (3.8 + Math.random() * 1.2).toFixed(1);
                  const reviews = Math.floor(Math.random() * 2000) + 50;
                  return (
                    <div key={product.id} className="product-card shop-card">
                      <div className="product-img-wrap">
                        <ProductImage src={product.image} alt={product.name} className="product-img" />
                        <span className="discount-badge">{discount}% off</span>
                      </div>
                      <div className="product-info">
                        <span className="product-category-tag">{product.category}</span>
                        <h3 className="product-name">{product.name}</h3>
                        {product.description && <p className="product-desc">{product.description}</p>}
                        <StarRating rating={parseFloat(rating)} count={reviews} />
                        <div className="price-row">
                          <span className="product-price">₹{Number(product.price).toLocaleString()}</span>
                          <span className="product-mrp">₹{originalPrice.toLocaleString()}</span>
                        </div>
                        <button onClick={() => addToCart(product)} className="add-cart-btn" id={`add-to-cart-${product.id}`}>
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CART ── */}
      {showCart && (
        <div className="page-wrap">
          <div className="section-header">
            <h2>🛒 My Cart</h2>
            {cart.length > 0 && <span className="count-pill">{cart.length} items</span>}
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add items to get started!</p>
              <button onClick={() => setShowCart(false)} className="auth-btn" style={{ marginTop: "16px", width: "auto", padding: "12px 32px" }}>Browse Products</button>
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
                <h3>Price Details</h3>
                <div className="summary-row"><span>Price ({cart.length} items)</span><span>₹{totalAmount.toLocaleString()}</span></div>
                <div className="summary-row"><span>Delivery Charges</span><span className="free-tag">FREE</span></div>
                <div className="summary-divider" />
                <div className="summary-total"><span>Total Amount</span><span>₹{totalAmount.toLocaleString()}</span></div>
                <p className="summary-saving">🎉 You save ₹{Math.round(totalAmount * 0.15).toLocaleString()} on this order!</p>
                <button onClick={() => setShowQR(true)} className="checkout-btn" id="checkout-btn">Proceed to Checkout →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QR PAYMENT MODAL ── */}
      {showQR && (
        <div className="overlay" onClick={(e) => e.target.className === "overlay" && setShowQR(false)}>
          <div className="qr-modal">
            <button className="modal-close" onClick={() => setShowQR(false)}>✕</button>
            <h2>Scan & Pay</h2>
            <p className="qr-amount">₹{totalAmount.toLocaleString()}</p>
            <div className="qr-wrap">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?am=${totalAmount}&cu=INR`} alt="QR Code" className="qr-img" />
            </div>
            <p className="qr-apps">PhonePe · Google Pay · Paytm · BHIM</p>
            <div className="qr-actions">
              <button onClick={handleCheckout} className="form-btn btn-green" id="confirm-payment-btn">✅ I've Paid</button>
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
            <a href="#">Beauty</a>
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
          <div className="footer-badge"><span>⭐</span> Top Brands</div>
        </div>
        <div className="footer-copy">© 2025 EShop. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default App;
