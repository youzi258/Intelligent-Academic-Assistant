# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import polish, paper_analysis

app = FastAPI(title="Academic Assistant System", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, should set specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(polish.router, prefix="/api/polish", tags=["polish"])
app.include_router(
    paper_analysis.router, prefix="/api/paper-analysis", tags=["paper-analysis"]
)


@app.get("/")
def read_root():
    return {"message": "Academic Assistant API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
