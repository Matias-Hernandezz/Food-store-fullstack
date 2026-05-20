from sqlmodel import Session
from app.modules.Ingrediente.repository import IngredienteRepository
from app.modules.Producto.repository import ProductoRepository
from app.modules.Categoria.repository import CategoriaRepository

class UnitOfWork:
    def __init__(self, session: Session):
        self._session = session

    def __enter__(self) -> "UnitOfWork":
        
        self.ingredientes = IngredienteRepository(self._session)
        self.productos = ProductoRepository(self._session)
        self.categorias = CategoriaRepository(self._session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self._session.commit() 
        else:
            self._session.rollback()

    def commit(self):
        self._session.commit()

    def rollback(self):
        self._session.rollback()