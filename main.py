# -*- coding: utf-8 -*-
# ============================================================
#   RAG + CrewAI + Groq — E-Commerce Multi-Agent System
# ============================================================
import monkey_patch  # Fix cache_breakpoint LiteLLM

import os
import sys
import io

os.environ["OPENAI_API_KEY"] = "fake-key"
os.environ["OPENAI_API_BASE"] = "https://api.groq.com/openai/v1"
os.environ["OPENAI_MODEL_NAME"] = "llama-3.3-70b-versatile"

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv

import chromadb
from chromadb.utils import embedding_functions
from groq import Groq
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

load_dotenv()


# ── LLM Groq ────────────────────────────────────────────
llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    temperature=0.3,
    max_tokens=300,
)
# ── 2. ChromaDB — Base vectorielle ──────────────────────────
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(
    name="ecommerce_knowledge",
    embedding_function=embedding_fn
)

# ── 3. Indexation des documents ─────────────────────────────
def index_documents():
    documents = [
        # Produits
        "iPhone Case Premium. Prix: 29 DT. Stock: 250 unites. Coque protection iPhone 14/15. Categorie: Accessoires. Marge: 60%.",
        "Samsung S24. Prix: 1200 DT. Stock: 5 unites CRITIQUE. Smartphone 128GB. Categorie: Telephones. Marge: 20%.",
        "Laptop Dell Inspiron. Prix: 2500 DT. Stock: 30 unites. i5 16GB RAM 512GB SSD. Categorie: Laptops. Marge: 15%.",
        "AirPods Pro. Prix: 450 DT. Stock: 45 unites. Ecouteurs sans fil Apple. Categorie: Accessoires. Marge: 35%.",
        "Chargeur USB-C Rapide. Prix: 35 DT. Stock: 120 unites. Charge rapide 65W. Categorie: Accessoires. Marge: 55%.",
        # Politiques
        "Politique retour: 30 jours pour retourner tout produit non utilise avec facture originale. Remboursement sous 5 jours.",
        "Livraison: 2-3 jours ouvrables en Tunisie. Gratuite au-dessus de 200 DT. Express 24h disponible +15 DT.",
        "Garantie: 1 an constructeur sur smartphones et laptops. 6 mois sur accessoires.",
        # Performances
        "Ventes ce mois: 1200 commandes. Panier moyen: 85 DT. Taux retour: 8%. CA total: 102000 DT.",
        "Top ventes: 1-iPhone Case (250), 2-Chargeur USB-C (180), 3-AirPods Pro (95). Croissance: +12% vs mois precedent.",
    ]

    ids = [f"doc_{i}" for i in range(len(documents))]
    existing = collection.get()

    if len(existing["ids"]) == 0:
        collection.add(documents=documents, ids=ids)
        print(f"[OK] {len(documents)} documents indexes dans ChromaDB")
    else:
        print(f"[OK] Collection deja chargee ({len(existing['ids'])} docs)")

# ── 4. RAG Tool pour les agents ─────────────────────────────
@tool("RAG Search Tool")
def rag_search(query: str) -> str:
    """
    Recherche dans la base de connaissances e-commerce (produits,
    politiques, performances). Utilise ce tool pour toute question
    sur le catalogue, les stocks, les prix ou les statistiques.
    """
    results = collection.query(
        query_texts=[query],
        n_results=4
    )
    if not results["documents"][0]:
        return "Aucune information trouvee dans la base de connaissances."

    context = "\n---\n".join(results["documents"][0])
    return f"Informations trouvees:\n{context}"


# ── 5. Agents avec RAG Tool ─────────────────────────────────

# Agent 1 : Recherche & Analyse Produits
product_researcher = Agent(
    role="Analyste Produits RAG",
    goal="Rechercher et analyser les informations produits depuis la base de connaissances",
    backstory=(
        "Expert en analyse de catalogue e-commerce. Utilise la base vectorielle "
        "pour extraire des insights precis sur les produits, stocks et marges."
    ),
    tools=[rag_search],
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# Agent 2 : Strategie Pricing
pricing_strategist = Agent(
    role="Stratege Pricing & Promotions",
    goal="Proposer des strategies de prix optimales basees sur les donnees reelles",
    backstory=(
        "Specialiste revenue management. Analyse les marges, la concurrence "
        "et les tendances pour maximiser le CA tout en restant competitif."
    ),
    tools=[rag_search],
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# Agent 3 : Service Client
customer_agent = Agent(
    role="Expert Service Client",
    goal="Fournir des reponses precises aux questions clients basees sur les politiques officielles",
    backstory=(
        "Expert relation client e-commerce. Connait parfaitement les politiques "
        "de retour, livraison et garantie pour repondre avec empathie et precision."
    ),
    tools=[rag_search],
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# Agent 4 : Directeur & Rapport Final
director_agent = Agent(
    role="Directeur E-Commerce & BI",
    goal="Synthetiser toutes les analyses et produire un rapport executif actionable",
    backstory=(
        "Directeur e-commerce avec 15 ans d'experience. Transforme les analyses "
        "en decisions strategiques claires et mesurables."
    ),
    tools=[rag_search],
    llm=llm,
    verbose=True,
    allow_delegation=True,
)

# ── 6. Taches ───────────────────────────────────────────────

task_product_analysis = Task(
    description=(
        "Utilisez le RAG Search Tool pour analyser le catalogue complet.\n"
        "Fournissez:\n"
        "1. Les produits les plus performants (ventes + marge)\n"
        "2. Les produits en stock critique (risque rupture)\n"
        "3. Les produits a mettre en avant cette semaine\n"
        "4. Recommandations d'optimisation des fiches produits"
    ),
    agent=product_researcher,
    expected_output="Rapport produits structure avec classement et alertes stock",
)

task_pricing = Task(
    description=(
        "Utilisez le RAG Search Tool pour analyser les prix et marges.\n"
        "Proposez:\n"
        "1. Strategie de prix pour booster les ventes de -20%\n"
        "2. 3 promotions concretes a lancer cette semaine\n"
        "3. Produits ou augmenter les prix sans perdre clients\n"
        "4. Bundle produits complementaires rentables"
    ),
    agent=pricing_strategist,
    expected_output="Plan promotionnel detaille avec prix et ROI estime",
    context=[task_product_analysis],
)

task_customer_faq = Task(
    description=(
        "Utilisez le RAG Search Tool pour consulter les politiques officielles.\n"
        "Generez un guide FAQ complet avec reponses types pour:\n"
        "- Suivi de commande\n"
        "- Retour et remboursement\n"
        "- Delais de livraison\n"
        "- Garantie produit\n"
        "- Questions sur les stocks\n"
        "Reponses professionnelles et empathiques."
    ),
    agent=customer_agent,
    expected_output="Guide FAQ avec 5 reponses types pretes a l'emploi",
)

task_executive_report = Task(
    description=(
        "Compilez les analyses de tous les agents et produisez un rapport executif.\n"
        "Le rapport doit inclure:\n"
        "1. Resume des performances du mois\n"
        "2. Top 3 actions prioritaires immediates\n"
        "3. Objectifs et KPIs pour le mois prochain\n"
        "4. Risques identifies et plans de mitigation\n"
        "5. Opportunites de croissance\n"
        "Format: Markdown professionnel"
    ),
    agent=director_agent,
    expected_output="Rapport executif complet en Markdown avec KPIs et plan d'action",
    context=[task_product_analysis, task_pricing, task_customer_faq],
)

# ── 7. Crew ─────────────────────────────────────────────────
def run_rag_crew():
    crew = Crew(
        agents=[
            product_researcher,
            pricing_strategist,
            customer_agent,
            director_agent,
        ],
        tasks=[
            task_product_analysis,
            task_pricing,
            task_customer_faq,
            task_executive_report,
        ],
        process=Process.sequential,
        verbose=True,
    )

    print("\n" + "=" * 60)
    print("   RAG + CrewAI + Groq — E-Commerce Intelligence")
    print("=" * 60)

    result = crew.kickoff()
    print("\n" + "=" * 60)
    print("   RAPPORT EXECUTIF FINAL")
    print("=" * 60)
    print(result)

    # Sauvegarde du rapport
    with open("rapport_final.md", "w", encoding="utf-8") as f:
        f.write(str(result))
    print("\n[OK] Rapport sauvegarde dans rapport_final.md")

    return result


# ── 8. Main ─────────────────────────────────────────────────
if __name__ == "__main__":
    print("[INIT] Chargement de la base de connaissances ChromaDB...")
    index_documents()
    run_rag_crew()