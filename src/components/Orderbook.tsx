import React from "react";
import OrderbookServices from "../services/OrderbookServices";
import "../styles/Orderbook.css";

interface Order {
  price: number;
  size: number;
  total: number;
}

interface OrderbookProps {
  bids: Order[];
  asks: Order[];
  groupingSize: number;
}

const Orderbook: React.FC<OrderbookProps> = ({ bids, asks, groupingSize }) => {
  const groupedBids = OrderbookServices.groupOrders(bids, groupingSize);
  const groupedAsks = OrderbookServices.groupOrders(asks, groupingSize);

  return (
    <div className="orderbook-container">
      <div className="bids-column">
        <table>
          <thead>
            <tr>
              <th className="order-item order-item-head">Total</th>
              <th className="order-item order-item-head">Size</th>
              <th className="order-item order-item-head">Price</th>
            </tr>
          </thead>
          <tbody>
            {groupedBids.map((group, groupIndex) => (
              <tr key={groupIndex}>
                {group.map((order, index) => (
                  <React.Fragment key={index}>
                    <td className="order-item">{order.total.toFixed(2)}</td>
                    <td className="order-item">{order.size}</td>
                    <td className="order-item text-green">
                      {order.price.toFixed(2)}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="asks-column">
        <table>
          <thead>
            <tr>
              <th className="order-item order-item-head">Price</th>
              <th className="order-item order-item-head">Size</th>
              <th className="order-item order-item-head">Total</th>
            </tr>
          </thead>
          <tbody>
            {groupedAsks.map((group, groupIndex) => (
              <tr key={groupIndex}>
                {group.map((order, index) => (
                  <React.Fragment key={index}>
                    <td className="order-item text-red">
                      {order.price.toFixed(2)}
                    </td>
                    <td className="order-item">{order.size}</td>
                    <td className="order-item">{order.total.toFixed(2)}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orderbook;
