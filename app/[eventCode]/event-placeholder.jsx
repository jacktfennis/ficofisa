"use client";

import { SmileOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, Form, Input, Modal, Typography, theme } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { reserveSpot } from "./api";

export default function EventPlaceholder({ event, eventCode, clipboardUnavailable }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const [form] = Form.useForm();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function submitReservation(guestCount) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setReservationError(null);
    try {
      const values = await form.validateFields();
      const result = await reserveSpot(eventCode, values.name, guestCount);
      if (result.status === "reserved") {
        setReservation(result);
        setRsvpOpen(false);
        router.refresh();
      } else if (result.status === "unavailable") {
        setReservationError("This event is full or the selected reservation is no longer available.");
      } else {
        setReservationError("Please enter a valid name and try again.");
      }
    } catch (error) {
      if (Array.isArray(error?.errorFields)) return;
      console.error("Could not save reservation:", error);
      setReservationError("Could not save your reservation. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <Flex vertical gap={token.marginSM} style={{ boxSizing: "border-box", marginInline: "auto", maxWidth: 560, minHeight: "100vh", padding: token.paddingLG, width: "100%" }}>
      {clipboardUnavailable && (
        <Alert
          type="warning"
          showIcon
          message="The event was saved, but its ID could not be copied automatically."
          description="Use the copy button below or select the ID and copy it manually."
        />
      )}
      <Typography.Title level={2} style={{ margin: 0, overflowWrap: "anywhere" }}>{event.eventName}</Typography.Title>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>Date</Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>{event.eventTime} - {event.eventDate}</Typography.Paragraph>
      </div>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>Description</Typography.Title>
        <Typography.Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{event.eventDescription}</Typography.Paragraph>
      </div>
      {reservation && reservation.acceptedEventInformation && (
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Accepted Event Information</Typography.Title>
          <Typography.Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{reservation.acceptedEventInformation}</Typography.Paragraph>
        </div>
      )}
      <section aria-labelledby="attendees-heading">
        <Typography.Title id="attendees-heading" level={4} style={{ margin: 0 }}>RSVPs</Typography.Title>
        {event.attendees.length === 0 ? (
          <Typography.Paragraph style={{ margin: 0 }}>No RSVPs yet.</Typography.Paragraph>
        ) : (
          <div role="region" aria-label="RSVP list" tabIndex={0} style={{ maxHeight: 240, overflowY: "auto" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {event.attendees.map((attendee) => (
                <li key={attendee.id} style={{ borderBottom: `1px solid ${token.colorSplit}`, paddingBlock: token.paddingSM, overflowWrap: "anywhere" }}>
                  {attendee.name}{attendee.guestCount === 2 ? " (w/ +1)" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      {reservation ? (
        <Alert type="success" showIcon title="Your RSVP has been saved." />
      ) : (
        <Flex justify="center" style={{ paddingTop: token.paddingLG }}>
          <Button
            type="primary"
            size="large"
            icon={<SmileOutlined />}
            onClick={() => setRsvpOpen(true)}
            style={{ height: 56, paddingInline: 32, fontSize: token.fontSizeHeading4 }}
          >
            RSVP now!
          </Button>
        </Flex>
      )}
      <Modal title="RSVP" open={rsvpOpen} onCancel={() => { if (!saving) setRsvpOpen(false); }} closable={!saving} mask={{ closable: !saving }} footer={null} centered>
        <Form
          form={form}
          onFinish={() => submitReservation(1)}
        >
          {reservationError && <Alert type="error" showIcon title={reservationError} style={{ marginBottom: token.margin }} />}
          <Form.Item name="name" rules={[{ required: true, whitespace: true, message: "Enter your name." }, { max: 200, message: "Your name must be 200 characters or fewer." }]}>
            <Input aria-label="Your name" placeholder="Your name" maxLength={200} disabled={saving} />
          </Form.Item>
          {event.eventAttendanceType === "plus-one" ? (
            <Flex gap={token.marginSM} wrap>
              <Button type="primary" loading={saving} onClick={() => submitReservation(1)} style={{ flex: 1 }}>Just Me</Button>
              <Button type="primary" loading={saving} onClick={() => submitReservation(2)} style={{ flex: 1 }}>RSVPing with +1</Button>
            </Flex>
          ) : (
            <Button type="primary" loading={saving} onClick={() => submitReservation(1)} block>Commit Now</Button>
          )}
        </Form>
      </Modal>
    </Flex>
  );
}
