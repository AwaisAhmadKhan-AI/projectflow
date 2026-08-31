from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import projects, issues

app = FastAPI(title="ProjectFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(issues.router)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}