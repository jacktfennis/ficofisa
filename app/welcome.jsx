"use client";

import { SmileOutlined } from "@ant-design/icons";
import { App, Button, ConfigProvider, DatePicker, Flex, Form, Input, Modal, Radio, Select, TimePicker, theme } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { makeNewEvent } from "./ficofisa/ficofisa";

const allowedTotals = Array.from({ length: 19 }, (_, index) => ({
  label: String(index + 2),
  value: index + 2,
}));

export default function Welcome() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [attendance, setAttendance] = useState("open");
  const [limitedTypesOpen, setLimitedTypesOpen] = useState(false);
  const [limitedType, setLimitedType] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const allowedTotal = Form.useWatch("maximumAllowed", form);
  const limitedLabel = limitedType && allowedTotal
    ? limitedType === "raw-cap"
      ? `Cap @${allowedTotal}`
      : `${allowedTotal} w/ +1s`
    : "Limited event";

  async function saveEvent(values) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    let eventId;
    try {
      eventId = await makeNewEvent(
        values.event,
        values.date.format("YYYY-MM-DD"),
        values.time.format("HH:mm"),
        values.description,
        attendance === "open" ? "open" : limitedType,
        values.maximumAllowed,
        values.limitedEventMessage,
      );
    } catch (error) {
      console.error("Could not save event:", error);
      message.error("Could not save your event. Please try again.");
      savingRef.current = false;
      setSaving(false);
      return;
    }

    let clipboardUnavailable = false;
    try {
      await navigator.clipboard.writeText(eventId);
    } catch {
      clipboardUnavailable = true;
    }

    router.push(`/${eventId}${clipboardUnavailable ? "?clipboard=unavailable" : ""}`);
  }

  return (
    <Flex
      vertical
      style={{
        boxSizing: "border-box",
        marginInline: "auto",
        maxWidth: 560,
        minHeight: "100vh",
        padding: token.paddingLG,
        width: "100%",
      }}
    >
      <ConfigProvider
        theme={{ components: { Form: { labelFontSize: token.fontSizeHeading4 } } }}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={saveEvent}>
          <Form.Item label="Event" name="event" rules={[{ required: true, whitespace: true, message: "Enter an event name." }]}>
            <Input />
          </Form.Item>
          <Flex gap={token.margin}>
            <Form.Item label="Date" name="date" rules={[{ required: true, message: "Choose a date." }]} style={{ flex: 1, minWidth: 0 }}>
              <DatePicker
                format="YYYY-MM-DD"
                placeholder="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label="Time" name="time" rules={[{ required: true, message: "Choose a time." }]} style={{ flex: 1, minWidth: 0 }}>
              <TimePicker use12Hours format="h:mm A" style={{ width: "100%" }} />
            </Form.Item>
          </Flex>
          <Form.Item label="Description" name="description" rules={[{ required: true, whitespace: true, message: "Enter a description." }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Flex gap={token.margin}>
            <Button
              aria-pressed={attendance === "limited"}
              aria-haspopup="dialog"
              onClick={() => {
                setAttendance("limited");
                setLimitedTypesOpen(true);
              }}
              style={{
                borderColor: token.colorError,
                ...(attendance === "limited" && {
                  backgroundColor: token.colorError,
                  color: token.colorText,
                }),
              }}
            >
              {limitedLabel}
            </Button>
            <Button
              aria-pressed={attendance === "open"}
              onClick={() => {
                setAttendance("open");
                setLimitedTypesOpen(false);
                setLimitedType(null);
                form.setFieldValue("maximumAllowed", undefined);
              }}
              style={{
                borderColor: token.colorSuccess,
                ...(attendance === "open" && {
                  backgroundColor: token.colorSuccess,
                  color: token.colorTextLightSolid,
                }),
              }}
            >
              Anyone can come
            </Button>
          </Flex>
          <Form.Item
            label="Maximum Allowed"
            name="maximumAllowed"
            rules={[{ required: true, message: "Choose the maximum allowed." }]}
            style={{ marginTop: token.marginLG }}
          >
            <Select placeholder="Choose a maximum" options={allowedTotals} />
          </Form.Item>
          <Form.Item
            label="Limited Event Message"
            name="limitedEventMessage"
            rules={[{ required: true, whitespace: true, message: "Enter a limited event message." }]}
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea rows={2} style={{ height: token.controlHeight * 2 }} />
          </Form.Item>
          <Flex justify="center" style={{ paddingTop: token.paddingLG }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SmileOutlined />}
              loading={saving}
              style={{ height: 56, paddingInline: 32, fontSize: token.fontSizeHeading4 }}
            >
              Save event
            </Button>
          </Flex>
        </Form>
      </ConfigProvider>
      <Modal
        title={
          <Flex align="center" gap={token.marginXS} style={{ paddingInlineEnd: token.paddingLG }}>
            <span style={{ whiteSpace: "nowrap" }}>Limited Event For</span>
            <Select
              aria-label="Total amount allowed"
              placeholder="#"
              options={allowedTotals}
              value={allowedTotal}
              onChange={(value) => form.setFieldValue("maximumAllowed", value)}
              style={{ width: 72, minWidth: 52 }}
            />
          </Flex>
        }
        open={limitedTypesOpen}
        onCancel={() => {
          setLimitedTypesOpen(false);
          if (!limitedType || !allowedTotal) {
            setAttendance("open");
            setLimitedType(null);
            form.setFieldValue("maximumAllowed", undefined);
          }
        }}
        footer={null}
        centered
      >
        <Radio.Group
          aria-label="Limited event type"
          value={limitedType}
          onChange={(event) => setLimitedType(event.target.value)}
        >
          <Flex vertical gap={token.marginXS}>
            <Radio value="raw-cap">Raw Cap</Radio>
            <Radio value="plus-one">With A Plus One</Radio>
          </Flex>
        </Radio.Group>
      </Modal>
    </Flex>
  );
}
