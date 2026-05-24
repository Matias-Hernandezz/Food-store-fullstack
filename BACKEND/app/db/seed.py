from sqlmodel import Session, select
from app.core.db import engine, create_all_tables
from app.core.security import hash_password
from app.modules.dominio_1.Usuarios.models import Usuario, Rol, UsuarioRol
from app.modules.dominio_3.Pedidos.models import FormaPago
ROLES = [
    {"codigo": "ADMIN",   "nombre": "Administrador",     "descripcion": "CRUD completo del sistema"},
    {"codigo": "STOCK",   "nombre": "Gestor de Stock",   "descripcion": "Leer productos, actualizar stock y disponibilidad"},
    {"codigo": "PEDIDOS", "nombre": "Gestor de Pedidos", "descripcion": "Ver y avanzar estados de pedidos"},
    {"codigo": "CLIENT",  "nombre": "Cliente",           "descripcion": "Catálogo, carrito y pedidos propios"},
]

FORMAS_PAGO = [
    {"codigo": "EFECTIVO",      "descripcion": "Efectivo contra entrega", "habilitado": True},
    {"codigo": "MERCADO_PAGO",  "descripcion": "Mercado Pago (QR/Link)",  "habilitado": True},
    {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia Bancaria",  "habilitado": True},
]

ADMIN_USER = {
    "nombre":   "Administrador",
    "apellido": "Sistema",
    "email":    "admin@gmail.com",
    "password": "AdminMati1234",
    "rol":      "ADMIN",
}

def run() -> None:
    print("=== Seed — Admin ===\n")
    create_all_tables()

    with Session(engine) as session:
        print("Roles:")
        for r in ROLES:
            existing = session.get(Rol, r["codigo"])
            if existing:
                print(f"  [=] Ya existe: {r['codigo']}")
            else:
                session.add(Rol(**r))
                print(f"  [+] Creado:    {r['codigo']} — {r['nombre']}")

        session.commit()

        print("\nFormas de Pago:")
        for fp in FORMAS_PAGO:
            existing_fp = session.get(FormaPago, fp["codigo"])
            if existing_fp:
                print(f"  [=] Ya existe: {fp['codigo']}")
            else:
                session.add(FormaPago(**fp))
                print(f"  [+] Creado:    {fp['codigo']} — {fp['descripcion']}")

        session.commit()

        print("\nUsuario admin:")
        existing_user = session.exec(
            select(Usuario).where(Usuario.email == ADMIN_USER["email"])
        ).first()

        if existing_user:
            print(f"  [=] Ya existe: {ADMIN_USER['email']}")
        else:
            usuario = Usuario(
                nombre=ADMIN_USER["nombre"],
                apellido=ADMIN_USER["apellido"],
                email=ADMIN_USER["email"],
                password_hash=hash_password(ADMIN_USER["password"]),
            )
            session.add(usuario)
            session.flush() 

            session.add(UsuarioRol(usuario_id=usuario.id, rol_codigo="ADMIN"))
            session.commit()

            print(f"  [+] Creado: {ADMIN_USER['email']} / {ADMIN_USER['password']}  (rol=ADMIN)")

    print("\n✓ Seed completado")
    print("\nCredenciales de acceso:")
    print(f"  Email    : {ADMIN_USER['email']}")
    print(f"  Password : {ADMIN_USER['password']}")
    print(f"  Rol      : ADMIN\n")


if __name__ == "__main__":
    run()