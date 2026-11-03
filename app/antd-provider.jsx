"use client";

import { App, ConfigProvider } from "antd";

export default function AntdProvider({ children, fontFamily }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily,
          colorPrimary: "#5F4BB6",
          colorInfo: "#86A5D9",
          colorSuccess: "#60D394",
          colorError: "#FFBE86",
          colorText: "#042A2B",
          colorTextHeading: "#042A2B",
          colorBorder: "#86A5D9",
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
