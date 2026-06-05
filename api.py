import asyncio
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="E-Commerce Multi-Agent API")

@app.on_event("startup")
async def startup():
    from main import index_documents
    index_documents()
    print("✅ ChromaDB indexé !")

@app.get("/")
def root():
    return {
        "message": "E-Commerce Multi-Agent API",
        "status": "running",
        "endpoints": ["/analyze", "/health"]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/analyze")
def analyze():
    try:
        from main import run_rag_crew
        import nest_asyncio
        nest_asyncio.apply()
        result = run_rag_crew()
        return {
            "status": "success",
            "result": str(result)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)