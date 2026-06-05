# 🛒 E-Commerce Multi-Agent AI System
Système complet d'intelligence artificielle multi-agents pour l'analyse et l'optimisation d'une boutique e-commerce.  
**Stack : CrewAI + RAG + ChromaDB + Groq (LLaMA 3.1 8B) + FastAPI + React**


---

## 🏆 Ce que fait ce projet

Ce système utilise *4 agents IA spécialisés* qui collaborent automatiquement pour :

- 🔍 *Analyser* le catalogue produits et détecter les ruptures de stock
- 💰 *Optimiser* les prix et créer des stratégies promotionnelles
- 💬 *Répondre* aux questions clients via une base de connaissances (RAG)
- 📊 *Générer* des rapports exécutifs complets en Markdown

---

## 🗺️ Architecture complète
👤 Utilisateur
      │
      ▼
⚛️  Frontend React (localhost:5173)
      │  HTTP + JSON
      ▼
🚀  FastAPI (localhost:8000)
      │
      ├──► 🤖 CrewAI — 4 Agents séquentiels
      │         │
      │         ├── Agent 1 : Analyste Produits
      │         ├── Agent 2 : Stratège Pricing
      │         ├── Agent 3 : Service Client
      │         └── Agent 4 : Directeur BI (rapport final)
      │
      ├──► 🗄️  ChromaDB — Base vectorielle (RAG)
      │         └── 10 documents indexés
      │
      └──► ⚡ Groq API — LLaMA 3.1 8B (gratuit)
                └── Inférence ultra-rapide


---

## 📁 Structure du projet

agentsIA/
│
├── 📁 rag_ecommerce/          ← BACKEND Python
│   ├── api.py                 ← FastAPI (5 endpoints)
│   ├── main.py                ← Pipeline CrewAI + RAG
│   ├── monkey_patch.py        ← Fix bug LiteLLM/Groq
│   ├── .env                   ← Clés API (non versionné)
│   ├── .env.example           ← Modèle configuration
│   ├── render.yaml            ← Config déploiement Render
│   ├── Procfile               ← Config déploiement Railway
│   ├── runtime.txt            ← Python 3.11
│   ├── requirements.txt       ← Dépendances Python
│   └── chroma_db/             ← Base vectorielle persistante
│
└── 📁 frontend/               ← FRONTEND React
    ├── src/
    │   ├── App.jsx            ← Interface complète (5 onglets)
    │   └── index.css          ← Tailwind CSS
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js

---

## ⚡ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| *LLM* | LLaMA 3.1 8B via Groq | Inférence gratuite et rapide |
| *Agents* | CrewAI ≥ 0.80 | Orchestration multi-agents |
| *RAG* | ChromaDB + SentenceTransformers | Base de connaissances vectorielle |
| *API* | FastAPI + Uvicorn | Serveur REST Python |
| *Frontend* | React + Vite + Tailwind | Interface utilisateur |
| *Deploy* | Render (gratuit) | Hébergement cloud |
| *Fix* | monkey_patch.py | Correction bug cache_breakpoint |

---

## 🤖 Les 4 Agents

### Agent 1 — Analyste Produits
Rôle     : Analyser le catalogue e-commerce
Outil    : RAG Search Tool (ChromaDB)
Output   : Rapport produits + alertes stock critique

### Agent 2 — Stratège Pricing
Rôle     : Optimiser les prix et créer des promotions
Outil    : RAG Search Tool (ChromaDB)
Output   : Plan promotionnel avec ROI estimé
Contexte : Reçoit l'output de l'Agent 1

### Agent 3 — Service Client
Rôle     : Répondre aux questions clients
Outil    : RAG Search Tool (ChromaDB)
Output   : Guide FAQ 5 questions/réponses types

### Agent 4 — Directeur BI
Rôle     : Synthétiser et produire le rapport final
Outil    : RAG Search Tool + délégation
Output   : Rapport exécutif Markdown complet
Contexte : Reçoit les outputs des Agents 1 + 2 + 3

---

## 🌐 API Endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| GET | / | Info de l'API |
| GET | /health | Statut système |
| POST | /ask | Question rapide RAG + Groq |
| POST | /analyze | Analyse complète 4 agents |
| POST | /products/add | Ajouter produit ChromaDB |
| GET | /products | Lister produits indexés |

---

## 🚀 Installation & Lancement

### Prérequis
- Python 3.11+
- Node.js 18+
- Clé API Groq gratuite : [console.groq.com](https://console.groq.com)

### Backend

# 1. Cloner
git clone https://github.com/votre-username/ecommerce-ai.git
cd ecommerce-ai/rag_ecommerce

# 2. Environnement virtuel
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac

# 3. Installer dépendances
pip install -r requirements.txt

# 4. Configurer .env
cp .env.example .env
# Ajouter votre GROQ_API_KEY dans .env

# 5. Lancer l'API
python api.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger)

### Frontend

cd ../frontend

# 1. Installer
npm install

# 2. Lancer
npm run dev
# → http://localhost:5173

---

## 🔧 Configuration .env

env
GROQ_API_KEY=gsk_votre_clé_groq_ici
OPENAI_API_KEY=fake-key
PYTHONIOENCODING=utf-8
PYTHONUTF8=1

---

## ☁️ Déploiement sur Render

# 1. Push sur GitHub
git add .
git commit -m "deploy"
git push origin main

# 2. Sur render.com :
# New+ → Web Service → Connecter repo GitHub
# Build : pip install -r requirements.txt
# Start : uvicorn api:app --host 0.0.0.0 --port $PORT

# 3. Variables d'environnement Render :
# GROQ_API_KEY = gsk_votre_clé
# OPENAI_API_KEY = fake-key
# PYTHONUTF8 = 1

---

## 🩹 Bugs corrigés

### 1. cache_breakpoint error — monkey_patch.py
Problème : CrewAI injecte cache_breakpoint que Groq ne reconnaît pas
Solution : Intercepter et nettoyer tous les appels LiteLLM avant envoi

### 2. ValidationError: llm.str
Problème : ChatGroq (LangChain) incompatible avec CrewAI v2+
Solution : Utiliser from crewai import LLM

### 3. ascii codec can't encode
Problème : Windows encode en CP1252 par défaut
Solution : PYTHONUTF8=1 + PYTHONIOENCODING=utf-8

### 4. Rate limit Groq
Problème : 100K tokens/jour épuisés avec llama-3.3-70b
Solution : Passer à llama-3.1-8b-instant (quota séparé)

---

## 📊 Flux d'exécution complet

python api.py
  │
  ├─► monkey_patch.py     Fix LiteLLM cache_breakpoint
  ├─► load .env           Charge GROQ_API_KEY
  ├─► ChromaDB init       Index 10 documents produits
  ├─► FastAPI start       Port 8000 prêt
  │
  POST /analyze
  │
  ├─► Agent 1 → rag_search("produits stock") → ChromaDB → Groq
  │         └── Output : rapport produits
  │
  ├─► Agent 2 → rag_search("prix marges")   → ChromaDB → Groq
  │         └── Output : plan promotionnel
  │
  ├─► Agent 3 → rag_search("politiques")    → ChromaDB → Groq
  │         └── Output : FAQ clients
  │
  └─► Agent 4 → synthèse agents 1+2+3       → Groq
            └── Output : rapport exécutif Markdown

  JSON response → React → Affichage ✅

---

## 🖥️ Interface React — 5 onglets

| Onglet | Fonctionnalité |
|---|---|
| *Dashboard* | Statut système, health check, architecture agents |
| *Analyse* | Lance les 4 agents, affiche le rapport complet |
| *Question* | Question rapide RAG + Groq (3-5 secondes) |
| *Produits* | Ajouter/lister produits dans ChromaDB |
| *FAQ* | Réponses clients depuis les politiques officielles |

---

## 📦 requirements.txt

fastapi>=0.110.0
uvicorn>=0.29.0
crewai>=0.80.0
groq>=0.9.0
chromadb>=0.5.0
sentence-transformers>=3.0.0
python-dotenv>=1.0.0
litellm>=1.0.0
nest-asyncio>=1.6.0
pydantic>=2.0.0

---

## 🗓️ Journal de développement

Jour 1 — Setup CrewAI + Groq
  ✅ 4 agents e-commerce créés
  ✅ Fix ValidationError (ChatGroq → crewai LLM)
  ✅ Fix ascii encoding Windows

Jour 2 — RAG + ChromaDB
  ✅ Base vectorielle créée
  ✅ RAG Tool intégré dans les agents
  ✅ Fix cache_breakpoint (monkey_patch)

Jour 3 — FastAPI + Deploy
  ✅ 6 endpoints REST créés
  ✅ Fix Rate Limit (70B → 8B instant)
  ✅ Config Render + Railway
  ✅ Interface React 5 onglets

---

## 🤝 Contribution

git checkout -b feature/nouvelle-fonctionnalite
git commit -m "feat: description"
git push origin feature/nouvelle-fonctionnalite
# → Ouvrir une Pull Request

---

## 📄 Licence

MIT License — Libre d'utilisation et modification.

---

## ✨ Auteur

Projet développé avec *CrewAI + Groq + ChromaDB + FastAPI + React*  
Formation pratique — du zéro au déploiement cloud en 3 jours 🚀