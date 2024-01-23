interface OrderData {
  bids: number[][];
  asks: number[][];
}

interface OrderWithTotal {
  price: number;
  size: number;
  total: number;
}

interface OrderbookData {
  bids: OrderWithTotal[];
  asks: OrderWithTotal[];
}

const processOrderData = (data: OrderData): OrderbookData => {
  const bids = data.bids || [];
  const asks = data.asks || [];

  const processSide = (orders: number[][]): OrderWithTotal[] => {
    const sortedOrders = orders.slice().sort((a, b) => b[0] - a[0]);

    let total = 0;
    const updatedOrderData = sortedOrders.map(([price, size]) => {
      total += size;
      return {
        price,
        size,
        total,
      };
    });

    return updatedOrderData;
  };

  const orderbids = processSide(bids);
  const orderasks = processSide(asks);

  return { bids: orderbids, asks: orderasks };
};

const groupOrders = (
  orders: OrderWithTotal[],
  groupingSize: number
): OrderWithTotal[][] => {
  const sortedOrders = orders.slice().sort((a, b) => b.price - a.price);

  const groupedOrders: OrderWithTotal[][] = [];
  let currentGroup: OrderWithTotal[] = [];
  let currentGroupPrice: number | null = null;

  sortedOrders.forEach((order) => {
    const roundedPrice = Math.floor(order.price / groupingSize) * groupingSize;

    if (currentGroupPrice === null) {
      currentGroup.push(order);
      currentGroupPrice = roundedPrice;
    } else if (currentGroupPrice === roundedPrice) {
      currentGroup.push(order);
    } else {
      groupedOrders.push(currentGroup);
      currentGroup = [order];
      currentGroupPrice = roundedPrice;
    }
  });

  if (currentGroup.length > 0) {
    groupedOrders.push(currentGroup);
  }

  return groupedOrders;
};

const orderbookUtils = {
  processOrderData,
  groupOrders,
};

export default orderbookUtils;
