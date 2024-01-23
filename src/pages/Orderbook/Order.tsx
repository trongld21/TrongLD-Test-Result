import React, { useEffect, useState } from "react";
import OrderbookServices from "../../services/OrderbookServices";
import Orderbook from "../../components/Orderbook";
import "../../styles/Order.css";
import * as Constants from "../../config/constants";

interface Order {
  price: number;
  size: number;
  total: number;
}

interface OrderbookData {
  bids: Order[];
  asks: Order[];
}

const Orders = () => {
  const [selectedMarket, setSelectedMarket] = useState<string>("PI_XBTUSD");
  const [orderData, setOrderData] = useState<OrderbookData>({
    bids: [],
    asks: [],
  });
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [groupingSizeOptions, setGroupingSizeOptions] = useState<number[]>([]);
  const [groupingSize, setGroupingSize] = useState<number>(0);

  useEffect(() => {
    const createWebSocket = () => {
      const newWs = new WebSocket(Constants.WS_BASE_URL);
      setWs(newWs);

      newWs.onopen = () => {
        newWs.send(
          JSON.stringify({
            event: "subscribe",
            feed: Constants.ORDER_BOOK_FEED,
            product_ids: [selectedMarket],
          })
        );
      };

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.feed === Constants.ORDER_BOOK_FEED && isWebSocketOpen) {
          const { bids, asks } = OrderbookServices.processOrderData(data);
          setOrderData({ bids, asks });
        }
      };

      newWs.onclose = (event) => {
        console.log("WebSocket closed:", event);

        if (event.code !== 1000 && event.reason !== "kill-feed") {
          console.error("WebSocket closed unexpectedly. Reason:", event.reason);
        }
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    setGroupingSizeOptions(
      selectedMarket === "PI_XBTUSD"
        ? Constants.GROUPING_SIZE_OPTIONS_XBTUSD
        : Constants.GROUPING_SIZE_OPTIONS_ETHUSD
    );

    createWebSocket();

    return () => {
      if (ws) {
        ws.close(1000, "kill-feed");
        setWs(null);
      }
    };
  }, [selectedMarket, isWebSocketOpen, ws]);

  const handleToggleFeed = () => {
    setSelectedMarket((prevSelectedMarket) => {
      const newMarket =
        prevSelectedMarket === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD";

      if (ws && ws.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          event: "unsubscribe",
          feed: "book_ui_1",
          product_ids: [prevSelectedMarket],
        };
        ws.send(JSON.stringify(unsubscribeMessage));

        const subscribeMessage = {
          event: "subscribe",
          feed: "book_ui_1",
          product_ids: [newMarket],
        };
        ws.send(JSON.stringify(subscribeMessage));

        setOrderData({ bids: [], asks: [] });
      }

      return newMarket;
    });
  };

  const handleKillFeed = () => {
    setIsWebSocketOpen((prevIsWebSocketOpen) => !prevIsWebSocketOpen);

    if (ws) {
      ws.close(1000, "kill-feed");
      setWs(null);

      const newWs = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
      setWs(newWs);

      newWs.onopen = () => {
        newWs.send(
          JSON.stringify({
            event: "subscribe",
            feed: "book_ui_1",
            product_ids: [selectedMarket],
          })
        );
      };

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.feed === "book_ui_1" && isWebSocketOpen) {
          const { bids, asks } = OrderbookServices.processOrderData(data);
          setOrderData({ bids, asks });
        }
      };

      newWs.onclose = (event) => {
        console.log("WebSocket closed:", event);

        if (event.code !== 1000 && event.reason !== "kill-feed") {
          console.error("WebSocket closed unexpectedly. Reason:", event.reason);
        }
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  };

  const handleGroupingChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newGroupingSize = parseFloat(event.target.value);
    setGroupingSize(newGroupingSize);
  };

  return (
    <div>
      <div className="order-container">
        <div className="order-head">
          <h2>Order Book</h2>
          <select
            id="groupingSelect"
            value={groupingSize}
            onChange={handleGroupingChange}
          >
            {groupingSizeOptions.map((option) => (
              <option key={option} value={option}>
                Group {option}
              </option>
            ))}
          </select>
        </div>
        <Orderbook
          bids={orderData.bids}
          asks={orderData.asks}
          groupingSize={groupingSize}
        />
        <div className="order-foot">
          <button
            className="custom-button-toggle custom-button"
            onClick={handleToggleFeed}
          >
            &#8644; Toggle Feed
          </button>
          <button
            className="custom-button-kill custom-button"
            onClick={handleKillFeed}
          >
            &#x26A0; {isWebSocketOpen ? "Kill Feed" : "Restart Feed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
