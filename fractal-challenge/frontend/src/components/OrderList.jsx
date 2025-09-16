import { useEffect, useState } from "react";
import { getOrders } from "../api";

function OrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  return (
    <div>
      <h2>Lista de Órdenes</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.order_number} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrderList;
