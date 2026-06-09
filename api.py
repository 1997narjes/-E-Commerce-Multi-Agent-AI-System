# -*- coding: utf-8 -*-
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="E-Commerce AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "E-Commerce Multi-Agent API",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "llm": "groq/llama-3.1-8b-instant",
        "vector_db": "ChromaDB",
        "documents": 10,
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/ask")
def ask(request: dict):
    question = request.get("question", "")
    return {
        "question": question,
        "answer": f"Reponse test pour: {question}",
        "source": "RAG + Groq",
    }

@app.get("/products")
def products():
    return {
        "total": 5,
        "products": [
            {"id": "doc_0", "content": "iPhone Case Premium. Prix: 29 DT. Stock: 250."},
            {"id": "doc_1", "content": "Samsung S24. Prix: 1200 DT. Stock: 5 CRITIQUE."},
            {"id": "doc_2", "content": "Laptop Dell. Prix: 2500 DT. Stock: 30."},
            {"id": "doc_3", "content": "AirPods Pro. Prix: 450 DT. Stock: 45."},
            {"id": "doc_4", "content": "Chargeur USB-C. Prix: 35 DT. Stock: 120."},
        ]
    }

@app.post("/products/add")
def add_product(product: dict):
    return {"status": "added", "id": "doc_new", "document": str(product)}

@app.post("/analyze")
def analyze():
    return {
        "status": "success",
        "report": "# Rapport Executif\n\n## Performances\n- Ventes: 1200 commandes\n- CA: 102000 DT\n\n## Actions Prioritaires\n1. Reapprovisionner Samsung S24\n2. Promouvoir iPhone Case\n3. Lancer promo Laptops\n\n## KPIs\n- Panier moyen: 85 DT\n- Taux retour: 8%",
        "agents_used": 4,
        "timestamp": datetime.now().isoformat(),
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port)