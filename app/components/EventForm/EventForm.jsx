"use client";

import { SmileOutlined } from "@ant-design/icons";
import { App, Button, ConfigProvider, DatePicker, Flex, Form, Input, Modal, Radio, Select, TimePicker, theme } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cancelEvent, createEvent, updateEvent } from "./api";

const allowedTotals = Array.from({ length: 19 }, (_, index) => ({
  label: String(index + 2),
  value: index + 2,
}));

export default function EventForm({ event = null }) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [attendance, setAttendance] = useState(event && event.eventAttendanceType !== "open" ? "limited" : "open");
  const [limitedTypesOpen, setLimitedTypesOpen] = useState(false);
  const [limitedType, setLimitedType] = useState(event && event.eventAttendanceType !== "open" ? event.eventAttendanceType : null);
  const [allowedTotal, setAllowedTotal] = useState(event?.maximumAllowed ?? null);
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const savingRef = useRef(false);
  const limitedLabel = limitedType && allowedTotal
    ? limitedType === "raw-cap"
      ? `Cap @${allowedTotal}`
      : `${allowedTotal} w/ +1s`
    : "Limited event";

  async function saveEvent(values) {
    if (savingRef.current) return;
    if (attendance === "limited" && (!limitedType || !allowedTotal)) {
      message.error("Choose a limit and type for your limited event.");
      setLimitedTypesOpen(true);
      return;
    }
    savingRef.current = true;
    setSaving(true);

    let eventId = event?.id;
    try {
      const details = [
        values.event,
        values.date.format("YYYY-MM-DD"),
        values.time.format("HH:mm"),
        values.description,
        attendance === "open" ? "open" : limitedType,
        attendance === "limited" ? allowedTotal : null,
        values.acceptedEventInformation || null,
      ];
      if (event) {
        const result = await updateEvent(event.id, ...details);
        if (result.status !== "updated") {
          message.error("Could not update this event. The limit must cover existing RSVPs, and a plus-one event cannot change type while it has RSVPs. The event may also be canceled or you may no longer have access.");
          savingRef.current = false;
          setSaving(false);
          return;
        }
      } else {
        eventId = await createEvent(...details);
      }
    } catch (error) {
      console.error("Could not save event:", error);
      message.error("Could not save your event. Please try again.");
      savingRef.current = false;
      setSaving(false);
      return;
    }

    if (event) {
      router.push(`/${eventId}`);
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

  async function confirmCancellation() {
    if (savingRef.current) return;
    savingRef.current = true;
    setCanceling(true);
    try {
      const result = await cancelEvent(event.id);
      if (result.status !== "canceled") {
        message.error("Could not cancel this event. It may already be canceled or you may no longer have access.");
        return;
      }
      router.push(`/${event.id}`);
    } catch (error) {
      console.error("Could not cancel event:", error);
      message.error("Could not cancel your event. Please try again.");
    } finally {
      savingRef.current = false;
      setCanceling(false);
    }
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={saveEvent}
          initialValues={event ? {
            event: event.eventName,
            date: dayjs(event.eventDate),
            time: dayjs(`2000-01-01T${event.eventTime}`),
            description: event.eventDescription,
            acceptedEventInformation: event.acceptedEventInformation,
          } : undefined}
        >
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
          <Flex gap={token.margin} wrap>
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
                setAllowedTotal(null);
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
            label="Accepted Event Information"
            name="acceptedEventInformation"
            rules={attendance === "limited" ? [{ required: true, whitespace: true, message: "Enter accepted event information." }] : []}
            style={{ marginTop: token.marginLG, marginBottom: 0 }}
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
              {event ? "Update event" : "Save event"}
            </Button>
          </Flex>
          {event && (
            <Flex vertical align="center" gap={token.marginSM} style={{ paddingTop: token.paddingLG }}>
              <Button danger onClick={() => setCancelOpen(true)} disabled={saving}>Cancel event</Button>
              <Button onClick={() => router.push(`/${event.id}`)} disabled={saving}>Back to event</Button>
            </Flex>
          )}
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
              onChange={setAllowedTotal}
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
            setAllowedTotal(null);
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
      <Modal
        title="Cancel this event?"
        open={cancelOpen}
        onCancel={() => { if (!canceling) setCancelOpen(false); }}
        onOk={confirmCancellation}
        okText="Cancel event"
        okButtonProps={{ danger: true, loading: canceling }}
        cancelText="Keep event"
        closable={!canceling}
        mask={{ closable: !canceling }}
        centered
      >
        The event page will show that it has been canceled and no new RSVPs will be accepted. This cannot be undone.
      </Modal>
    </Flex>
  );
}
