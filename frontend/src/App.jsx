import { useState } from "react";

const API_URL = "https://e-commerce-multi-agent-ai-system-api.onrender.com";

const tabs = ["Dashboard", "Analyse", "Question", "Produits", "FAQ"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [askQuestion, setAskQuestion] = useState("");
  const [askResult, setAskResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqResult, setFaqResult] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", stock: "",
    category: "", description: "", margin: ""
  });
  const [addStatus, setAddStatus] = useState(null);
  const [error, setError] = useState(null);

  const callAPI = async (path, method = "GET", body = null) => {
    setLoading(true);
    setError(null);
    try {
      const opts = {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),};

        const res = await fetch(`${API_URL}${path}`, opts); 
            const data = await res.json();
      return data;
    } catch (e) {
      setError("Erreur de connexion a l'API.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    const data = await callAPI("/health");
    if (data) setHealth(data);
  };

  const runAnalysis = async () => {
    const data = await callAPI("/analyze", "POST");
    if (data) setAnalyzeResult(data);
  };

  const runAsk = async () => {
    if (!askQuestion.trim()) return;
    const data = await callAPI("/ask", "POST", { question: askQuestion });
    if (data) setAskResult(data);
  };

  const loadProducts = async () => {
    const data = await callAPI("/products");
    if (data) setProducts(data.products || []);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const data = await callAPI("/products/add", "POST", {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      category: newProduct.category,
      description: newProduct.description,
      margin: newProduct.margin ? parseFloat(newProduct.margin) : null,
    });
    if (data) {
      setAddStatus("Produit ajoute !");
      setNewProduct({ name: "", price: "", stock: "", category: "", description: "", margin: "" });
      loadProducts();
    }
  };

  const runFaq = async () => {
    if (!faqQuestion.trim()) return;
    const data = await callAPI("/ask", "POST", { question: faqQuestion });
    if (data) setFaqResult(data);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1f2937", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#4f46e5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛒</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 16 }}>E-Commerce AI</div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>CrewAI + RAG + Groq</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }}></div>
          <span style={{ color: "#4ade80", fontSize: 12 }}>API Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1f2937", display: "flex", padding: "0 24px" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, border: "none", borderBottom: activeTab === t ? "2px solid #6366f1" : "2px solid transparent", color: activeTab === t ? "#818cf8" : "#9ca3af", background: "transparent", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: "16px 24px", background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {activeTab === "Dashboard" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Dashboard</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Statut du systeme multi-agents</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "LLM", value: "LLaMA 3.1 8B", icon: "🧠" },
                { label: "Vector DB", value: "ChromaDB", icon: "🗄️" },
                { label: "Framework", value: "CrewAI", icon: "🤖" },
                { label: "Inference", value: "Groq", icon: "⚡" },
              ].map(c => (
                <div key={c.label} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontWeight: 600 }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Health Check</h3>
              <button onClick={checkHealth} disabled={loading}
                style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, opacity: loading ? 0.5 : 1 }}>
                {loading ? "Verification..." : "🔍 Verifier l'API"}
              </button>
              {health && (
                <div style={{ marginTop: 16 }}>
                  {Object.entries(health).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937", fontSize: 14 }}>
                      <span style={{ color: "#9ca3af" }}>{k}</span>
                      <span style={{ color: k === "status" ? "#4ade80" : "white" }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYSE */}
        {activeTab === "Analyse" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Analyse complete</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Lance les 4 agents CrewAI</p>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
              <div style={{ background: "#422006", border: "1px solid #92400e", borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 14, color: "#fde68a" }}>
                ⏱️ Temps estime : 1-2 minutes — 4 agents travaillent en sequence
              </div>
              <button onClick={runAnalysis} disabled={loading}
                style={{ width: "100%", background: "#4f46e5", color: "white", border: "none", padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600, opacity: loading ? 0.5 : 1 }}>
                {loading ? "Agents en cours..." : "🚀 Lancer l'analyse complete"}
              </button>
            </div>
            {analyzeResult && (
              <div style={{ marginTop: 20, background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
                <div style={{ color: "#4ade80", fontWeight: 600, marginBottom: 12 }}>✅ Rapport executif</div>
                <div style={{ background: "#030712", borderRadius: 8, padding: 16, fontSize: 13, color: "#d1d5db", whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto", fontFamily: "monospace" }}>
                  {analyzeResult.report}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUESTION */}
        {activeTab === "Question" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Question rapide</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>RAG + Groq — reponse en quelques secondes</p>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
              <textarea value={askQuestion} onChange={e => setAskQuestion(e.target.value)}
                placeholder="Ex: Quel produit est en stock critique ?"
                rows={3} style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: 12, color: "white", fontSize: 14, resize: "none", marginBottom: 12, boxSizing: "border-box" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Stock critique ?", "Politique retour ?", "Delais livraison ?", "Top ventes ?"].map(q => (
                  <button key={q} onClick={() => setAskQuestion(q)}
                    style={{ background: "#1f2937", border: "1px solid #374151", color: "#d1d5db", padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer" }}>
                    {q}
                  </button>
                ))}
              </div>
              <button onClick={runAsk} disabled={loading || !askQuestion.trim()}
                style={{ width: "100%", background: "#4f46e5", color: "white", border: "none", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 14, opacity: (loading || !askQuestion.trim()) ? 0.5 : 1 }}>
                {loading ? "Recherche..." : "🔍 Poser la question"}
              </button>
            </div>
            {askResult && (
              <div style={{ marginTop: 20, background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 600 }}>QUESTION</div>
                <div style={{ background: "#1f2937", borderRadius: 8, padding: 12, fontSize: 14, color: "#d1d5db" }}>{askResult.question}</div>
                <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>REPONSE</div>
                <div style={{ background: "#1f2937", borderRadius: 8, padding: 12, fontSize: 14, color: "white" }}>{askResult.answer}</div>
              </div>
            )}
          </div>
        )}

        {/* PRODUITS */}
        {activeTab === "Produits" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Gestion Produits</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Ajouter et consulter les produits</p>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Ajouter un produit</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { key: "name", placeholder: "Nom du produit", span: true },
                  { key: "price", placeholder: "Prix (DT)" },
                  { key: "stock", placeholder: "Stock" },
                  { key: "category", placeholder: "Categorie" },
                  { key: "margin", placeholder: "Marge (%)" },
                  { key: "description", placeholder: "Description", span: true },
                ].map(f => (
                  <input key={f.key} value={newProduct[f.key]}
                    onChange={e => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ gridColumn: f.span ? "1/-1" : "auto", background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 14 }} />
                ))}
              </div>
              <button onClick={addProduct} disabled={loading}
                style={{ marginTop: 16, width: "100%", background: "#16a34a", color: "white", border: "none", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
                + Ajouter le produit
              </button>
              {addStatus && <div style={{ marginTop: 8, color: "#4ade80", fontSize: 14, textAlign: "center" }}>{addStatus}</div>}
            </div>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontWeight: 600 }}>Produits indexes</h3>
                <button onClick={loadProducts} disabled={loading}
                  style={{ background: "#1f2937", border: "1px solid #374151", color: "#d1d5db", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                  🔄 Charger
                </button>
              </div>
              {products.length === 0 ? (
                <div style={{ color: "#6b7280", textAlign: "center", padding: "24px 0", fontSize: 14 }}>Cliquez sur "Charger"</div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {products.map(p => (
                    <div key={p.id} style={{ background: "#1f2937", borderRadius: 8, padding: 12, fontSize: 13, color: "#d1d5db" }}>
                      <span style={{ color: "#818cf8", fontFamily: "monospace", marginRight: 8 }}>[{p.id}]</span>
                      {p.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === "FAQ" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Service Client FAQ</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Reponses automatiques basees sur vos politiques</p>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 }}>
              <input value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)}
                placeholder="Question client ex: Comment retourner un produit ?"
                style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "12px", color: "white", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Comment retourner ?", "Delai livraison ?", "Garantie smartphone ?", "Remboursement ?"].map(q => (
                  <button key={q} onClick={() => setFaqQuestion(q)}
                    style={{ background: "#1f2937", border: "1px solid #374151", color: "#d1d5db", padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer" }}>
                    {q}
                  </button>
                ))}
              </div>
              <button onClick={runFaq} disabled={loading || !faqQuestion.trim()}
                style={{ width: "100%", background: "#4f46e5", color: "white", border: "none", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 14, opacity: (loading || !faqQuestion.trim()) ? 0.5 : 1 }}>
                {loading ? "Recherche..." : "💬 Obtenir la reponse"}
              </button>
            </div>
            {faqResult && (
              <div style={{ marginTop: 20, background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                  <div style={{ background: "#1f2937", borderRadius: 8, padding: 12, fontSize: 14, color: "#d1d5db" }}>{faqResult.question}</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🤖</div>
                  <div style={{ background: "#1f2937", borderRadius: 8, padding: 12, fontSize: 14, color: "white" }}>{faqResult.answer}</div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}