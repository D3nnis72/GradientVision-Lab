from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api import routes_analysis, routes_gradients, routes_images, routes_reconstruct
from .models import config


def create_app() -> FastAPI:
    config.ensure_directories()

    app = FastAPI(title="Gradient Field Backend", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")

    app.include_router(routes_images.router)
    app.include_router(routes_gradients.router)
    app.include_router(routes_reconstruct.router)
    app.include_router(routes_analysis.router)
    return app


app = create_app()

