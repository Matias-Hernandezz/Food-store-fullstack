from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.modules.Categoria.models import Categoria
from app.modules.Producto.models import Producto, ProductoCategoria
from app.modules.Ingrediente.models import Ingrediente
import os
from app.modules.Categoria.routers import router as router_categoria
from app.modules.Producto.routers import router as router_producto
from app.modules.Ingrediente.routers import router as router_ingrediente
from app.routers.uploads import router as router_uploads
from fastapi.responses import JSONResponse
import traceback
from fastapi import Request
app = FastAPI(title="Prueba de Swagger")

@app.on_event("startup")
def on_startup():
    init_db()

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()  # imprime en la consola del uvicorn
    return JSONResponse(status_code=500, content={"detail": str(exc)})
app.include_router(router_categoria)
app.include_router(router_producto)
app.include_router(router_ingrediente)
app.include_router(router_uploads)

origins = [
    "http://localhost:5173",  
    "http://localhost:5174",  
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "ok"}

