# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/reto_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# ---------- MODELOS ----------
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    unit_price = Column(Float)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Integer)
    total_price = Column(Float)

    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True)
    status = Column(String(20), default="Pending")

    items = relationship("OrderItem", cascade="all, delete")

Base.metadata.create_all(bind=engine)

# ---------- SCHEMAS ----------
class OrderItemSchema(BaseModel):
    product_id: int
    qty: int

class OrderSchema(BaseModel):
    order_number: str
    items: list[OrderItemSchema]

# ---------- APP ----------
app = FastAPI()

# Productos
@app.get("/api/products")
def get_products():
    db = SessionLocal()
    return db.query(Product).all()

@app.post("/api/products")
def add_product(p: Product):
    db = SessionLocal()
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

# Órdenes
@app.get("/api/orders")
def get_orders():
    db = SessionLocal()
    return db.query(Order).all()

@app.post("/api/orders")
def create_order(order: OrderSchema):
    db = SessionLocal()
    new_order = Order(order_number=order.order_number)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for it in order.items:
        prod = db.query(Product).filter_by(id=it.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
        db.add(OrderItem(
            order_id=new_order.id,
            product_id=prod.id,
            qty=it.qty,
            total_price=prod.unit_price * it.qty
        ))
    db.commit()
    return {"message": "Order created", "id": new_order.id}

@app.patch("/api/orders/{order_id}/status")
def update_status(order_id: int, status: str):
    db = SessionLocal()
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": "Status updated"}

@app.delete("/api/orders/{order_id}")
def delete_order(order_id: int):
    db = SessionLocal()
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
