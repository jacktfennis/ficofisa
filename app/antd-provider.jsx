"use client";

import { App, ConfigProvider } from "antd";

export default function AntdProvider({ children, fontFamily }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
