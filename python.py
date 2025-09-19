# main.py
import os
import socket
from typing import Iterator, List

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import Column, Float, ForeignKey, Integer, String, create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import (
    Session,
    declarative_base,
    relationship,
    selectinload,
    sessionmaker,
)
from urllib.parse import quote_plus


def _resolve_mysql_host() -> str:
    """Return the host used to connect to MySQL.

    Preference order:
    1. Explicit MYSQL_HOST env var.
    2. Docker service name ``mi-mysql-db`` (used in the provided docker run command).
    3. Localhost, for developers running MySQL locally.
    """

    host = os.getenv("MYSQL_HOST")
    if host and host.strip():
        return host.strip()

    docker_service_name = "mi-mysql-db"
    try:
        socket.gethostbyname(docker_service_name)
        return docker_service_name
    except socket.gaierror:
        return "localhost"


def _resolve_mysql_password() -> str:
    """Return the password used to connect to MySQL.

    Checks common env vars and finally falls back to the password shared in the
    project instructions (``mi-clave-secreta``).
    """

    for key in ("MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD"):
        value = os.getenv(key)
        if value is not None and value.strip():
            return value.strip()

    # Default password used when the MySQL container is started with
    #   docker run --name mi-mysql-db -e MYSQL_ROOT_PASSWORD=mi-clave-secreta
    return "mi-clave-secreta"


def _resolve_mysql_user() -> str:
    return (os.getenv("MYSQL_USER") or os.getenv("MYSQL_USERNAME") or "root").strip()


def _resolve_mysql_port() -> str:
    return (os.getenv("MYSQL_PORT") or "3306").strip()


def _resolve_mysql_database() -> str:
    return (
        os.getenv("MYSQL_DATABASE")
        or os.getenv("MYSQL_DB")
        or os.getenv("DATABASE_NAME")
        or "reto_db"
    ).strip()


def build_database_url() -> str:
    explicit_url = os.getenv("DATABASE_URL")
    if explicit_url and explicit_url.strip():
        return explicit_url.strip()

    user = _resolve_mysql_user()
    password = quote_plus(_resolve_mysql_password())
    host = _resolve_mysql_host()
    port = _resolve_mysql_port()
    database = _resolve_mysql_database()
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"


DATABASE_URL = build_database_url()

def ensure_database_exists(url: str) -> None:
    db_url = make_url(url)
    database_name = db_url.database

    if not database_name or not db_url.get_backend_name().startswith("mysql"):
        return

    server_url = db_url.set(database=None)
    temp_engine = create_engine(server_url, pool_pre_ping=True, future=True)
    try:
        with temp_engine.connect() as connection:
            connection.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{database_name}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
    finally:
        temp_engine.dispose()


try:
    ensure_database_exists(DATABASE_URL)
except SQLAlchemyError as exc:
    raise RuntimeError(f"Unable to ensure database exists: {exc}") from exc


engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


# ---------- MODELOS ----------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)

    product = relationship("Product")
    order = relationship("Order", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="Pending")

    items = relationship(
        "OrderItem",
        cascade="all, delete-orphan",
        back_populates="order",
        passive_deletes=True,
    )


try:
    Base.metadata.create_all(bind=engine)
except SQLAlchemyError as exc:
    # Re-raise with a clearer message so FastAPI logs expose the root cause.
    raise RuntimeError(f"Unable to initialize database schema: {exc}") from exc


# ---------- SCHEMAS ----------
class ProductCreate(BaseModel):
    name: str = Field(..., max_length=100)
    unit_price: float = Field(..., gt=0)


class ProductOut(ProductCreate):
    id: int

    class Config:
        orm_mode = True


class OrderItemSchema(BaseModel):
    product_id: int
    qty: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    order_number: str = Field(..., max_length=50)
    items: List[OrderItemSchema]


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    qty: int
    total_price: float
    product: ProductOut | None = None

    class Config:
        orm_mode = True


class OrderOut(BaseModel):
    id: int
    order_number: str
    status: str
    items: List[OrderItemOut]

    class Config:
        orm_mode = True


class StatusUpdate(BaseModel):
    status: str = Field(..., max_length=20)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- APP ----------
app = FastAPI()


# Productos
@app.get("/api/products", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@app.post(
    "/api/products",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
)
def add_product(payload: ProductCreate, db: Session = Depends(get_db)):
    normalized_name = payload.name.strip()
    if not normalized_name:
        raise HTTPException(status_code=400, detail="Product name is required")

    product = Product(name=normalized_name, unit_price=payload.unit_price)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# Órdenes
@app.get("/api/orders", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .order_by(Order.id)
        .all()
    )


@app.post("/api/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    normalized_number = order.order_number.strip()
    if not normalized_number:
        raise HTTPException(status_code=400, detail="Order number is required")

    existing = db.query(Order).filter(Order.order_number == normalized_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Order number already exists")

    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    new_order = Order(order_number=normalized_number)
    db.add(new_order)
    db.flush()  # Ensure new_order.id is populated before creating items.

    for item in order.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found",
            )

        db.add(
            OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                qty=item.qty,
                total_price=product.unit_price * item.qty,
            )
        )

    db.commit()

    return (
        db.query(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .filter(Order.id == new_order.id)
        .one()
    )


@app.patch("/api/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = payload.status.strip()
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    order.status = new_status
    db.commit()

    return (
        db.query(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .filter(Order.id == order_id)
        .one()
    )


@app.delete("/api/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
