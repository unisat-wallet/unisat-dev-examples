import React from "react";
import "./styles/App.css";
import { Card, Tabs } from "antd";
import { Swap } from "./components/Swap";

function App() {
  return (
    <div className="app">
      <div className="main-container">
        <Card size={"small"} className={"mt-16"}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              InSwap Demo
            </h3>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>
              This demo shows how to integrate with{" "}
              <a
                href="https://inswap.cc/"
                target="_blank"
                rel="noopener noreferrer"
              >
                InSwap
              </a>
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#999" }}>
              API Documentation:{" "}
              <a
                href="https://github.com/unisat-wallet/unisat-dev-docs/blob/master/open-api/auto-generated/docs/brc20-swap.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                BRC20 Swap API
              </a>
            </p>
          </div>
        </Card>
        <Card
          bordered={false}
          size={"small"}
          style={{ marginTop: 16, paddingTop: 0 }}
        >
          <Tabs
            defaultActiveKey="1"
            tabPosition="top"
            items={[{ key: "1", label: "Swap", children: <Swap /> }]}
          />
        </Card>
      </div>
    </div>
  );
}

export default App;
