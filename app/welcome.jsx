"use client";

import { SmileOutlined } from "@ant-design/icons";
import { Card, Flex, Layout, theme } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

export default function Welcome() {
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          paddingInline: token.paddingLG,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Ficofisa
        </Title>
      </Header>
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: token.paddingLG,
        }}
      >
        <Card style={{ width: "100%", maxWidth: 520 }}>
          <Flex vertical align="center" gap={token.marginSM}>
            <SmileOutlined style={{ fontSize: 40, color: token.colorPrimary }} />
            <Title level={2} style={{ margin: 0, textAlign: "center" }}>
              Welcome
            </Title>
            <Paragraph
              style={{
                marginBottom: 0,
                textAlign: "center",
                color: token.colorTextSecondary,
              }}
            >
              You&apos;re in. This is the home of Ficofisa.
            </Paragraph>
          </Flex>
        </Card>
      </Content>
      <Footer style={{ textAlign: "center" }}>Ficofisa</Footer>
    </Layout>
  );
}
