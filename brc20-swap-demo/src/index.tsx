import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { ConfigProvider } from "antd";
import WalletProvider from "./provider/WalletProvider";
import NoticeProvider from "./provider/NoticeProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ebb94c",
        },
        components: {
          InputNumber: {
            colorTextDisabled: "#222",
          },
        },
      }}
    >
      <NoticeProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </NoticeProvider>
    </ConfigProvider>
  </React.StrictMode>
);
