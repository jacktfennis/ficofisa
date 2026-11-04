"use client";

import { Alert, App, Button, Flex, Typography, theme } from "antd";
import Link from "next/link";

export default function EventPlaceholder({ eventId, clipboardUnavailable }) {
  const { message } = App.useApp();
  const { token } = theme.useToken();

  async function copyId() {
    try {
      await navigator.clipboard.writeText(eventId);
      message.success("Event ID copied.");
    } catch {
      message.error("Could not copy the event ID. Please select and copy it manually.");
    }
  }

  return (
    <Flex vertical gap={token.margin} style={{ marginInline: "auto", maxWidth: 560, padding: token.paddingLG }}>
      <Typography.Title level={1}>Event</Typography.Title>
      {clipboardUnavailable && (
        <Alert
          type="warning"
          showIcon
          message="The event was saved, but its ID could not be copied automatically."
          description="Use the copy button below or select the ID and copy it manually."
        />
      )}
      <Typography.Paragraph>Event ID: <Typography.Text code>{eventId}</Typography.Text></Typography.Paragraph>
      <Flex gap={token.margin}>
        <Button onClick={copyId}>Copy event ID</Button>
        <Link href="/">Create another event</Link>
      </Flex>
    </Flex>
  );
}
