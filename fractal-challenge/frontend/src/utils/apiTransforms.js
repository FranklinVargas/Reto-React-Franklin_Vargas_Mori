const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseId = (value) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
};

export const normalizeProduct = (product = {}) => {
  const id = parseId(
    product.id ??
      product.productId ??
      product.product_id ??
      product.ID
  );

  const name =
    product.name ??
    product.productName ??
    product.product_name ??
    product.title ??
    "";

  const unitPriceSource =
    product.unitPrice ??
    product.unit_price ??
    product.price ??
    product.unitprice ??
    product.productPrice ??
    product.product_price;

  return {
    id,
    name,
    unitPrice: toNumber(unitPriceSource),
  };
};

export const serializeProductInput = ({ name, unitPrice }) => {
  const normalizedPrice = toNumber(unitPrice);
  return {
    name,
    unitPrice: normalizedPrice,
    unit_price: normalizedPrice,
    price: normalizedPrice,
  };
};

const normalizeOrderItem = (item = {}) => {
  const product = item.Product ?? item.product ?? {};
  const productId = parseId(
    item.productId ??
      item.product_id ??
      item.id ??
      product.id ??
      item.OrderProduct?.productId ??
      item.OrderProduct?.product_id
  );

  const name =
    item.name ??
    item.productName ??
    product.name ??
    item.ProductName ??
    "";

  const unitPriceSource =
    item.unitPrice ??
    item.unit_price ??
    product.unitPrice ??
    product.unit_price ??
    product.price ??
    item.price ??
    item.unitprice;

  const qtySource = item.qty ?? item.quantity ?? item.count ?? item.amount ?? 0;

  const totalSource =
    item.totalPrice ??
    item.total_price ??
    (unitPriceSource ?? 0) * (qtySource ?? 0);

  return {
    productId,
    name,
    unitPrice: toNumber(unitPriceSource),
    qty: toNumber(qtySource, 0),
    totalPrice: toNumber(totalSource),
  };
};

export const normalizeOrder = (order = {}) => {
  const itemsRaw =
    order.items ??
    order.orderItems ??
    order.OrderItems ??
    order.products ??
    order.OrderProducts ??
    order.order_items ??
    [];

  const items = itemsRaw.map(normalizeOrderItem);

  const productsCountSource =
    order.productsCount ??
    order.products_count ??
    order.itemsCount ??
    order.items_count ??
    order.totalProducts ??
    order.total_products ??
    items.reduce((sum, it) => sum + toNumber(it.qty, 0), 0);

  const finalPriceSource =
    order.finalPrice ??
    order.final_price ??
    order.total ??
    order.totalPrice ??
    order.amount ??
    order.total_amount;

  const dateSource =
    order.date ??
    order.createdAt ??
    order.created_at ??
    order.datetime ??
    order.updatedAt ??
    order.updated_at ??
    null;

  const orderNumber =
    order.orderNumber ??
    order.order_number ??
    order.number ??
    order.orderNo ??
    order.code ??
    "";

  return {
    id: parseId(order.id ?? order.orderId ?? order.order_id),
    orderNumber,
    date: dateSource,
    productsCount: toNumber(productsCountSource, 0),
    finalPrice: toNumber(finalPriceSource),
    status: order.status ?? order.orderStatus ?? order.state ?? "Pending",
    items,
  };
};

export const serializeOrderPayload = ({ orderNumber, items, status }) => {
  const normalizedItems = items.map((item) => {
    const qty = toNumber(item.qty, 0);
    const productId = parseId(item.productId ?? item.id);
    return {
      productId,
      product_id: productId,
      qty,
      quantity: qty,
    };
  });

  const payload = {
    orderNumber,
    order_number: orderNumber,
    items: normalizedItems,
    orderItems: normalizedItems,
    order_items: normalizedItems,
    products: normalizedItems,
    orderProducts: normalizedItems,
    order_products: normalizedItems,
  };

  if (status) {
    payload.status = status;
    payload.order_status = status;
    payload.state = status;
  }

  return payload;
};

export const buildStatusPayload = (status) => ({
  status,
  order_status: status,
});
