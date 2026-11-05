"use client";

import { EditOutlined, SmileOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, Form, Input, Modal, Typography, theme } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadReservation, removePlusOne, reserveSpot, withdrawSpot } from "./api";
import styles from "./reservation-confetti.module.css";

const confettiPieces = Array.from({ length: 600 }, (_, index) => index);

export default function EventPlaceholder({ event, eventCode, clipboardUnavailable }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const [form] = Form.useForm();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [reservationCheck, setReservationCheck] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null);
  const [celebration, setCelebration] = useState(0);
  const savingRef = useRef(false);
  const checkVersion = useRef(0);
  const channelRef = useRef(null);
  const isFull = event.eventAttendanceType !== "open" && event.reservedCount >= event.maximumAllowed;

  const checkReservation = useCallback(async () => {
    if (savingRef.current) return;
    const version = ++checkVersion.current;
    try {
      const result = await loadReservation(eventCode);
      if (version !== checkVersion.current) return;
      setReservation(result.status === "reserved" ? result : null);
      setReservationCheck("ready");
    } catch (error) {
      if (version !== checkVersion.current) return;
      console.error("Could not check reservation:", error);
      setReservationCheck("error");
    }
  }, [eventCode]);

  useEffect(() => {
    checkReservation();
    const versionRef = checkVersion;
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(`ficofisa-rsvp-${eventCode}`);
    channelRef.current = channel;
    function syncReservation() {
      checkReservation();
      router.refresh();
    }
    if (channel) channel.addEventListener("message", syncReservation);
    window.addEventListener("focus", syncReservation);
    return () => {
      ++versionRef.current;
      if (channel) channel.close();
      channelRef.current = null;
      window.removeEventListener("focus", syncReservation);
    };
  }, [checkReservation, eventCode, router]);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(0), 4600);
    return () => clearTimeout(timeout);
  }, [celebration]);

  async function submitReservation(guestCount) {
    if (savingRef.current) return;
    savingRef.current = true;
    ++checkVersion.current;
    setSaving(true);
    setReservationError(null);
    setActionError(null);
    try {
      const values = await form.validateFields();
      const result = await reserveSpot(eventCode, values.name, guestCount);
      if (result.status === "reserved") {
        setReservation(result);
        setRsvpOpen(false);
        setCelebration((previous) => previous + 1);
        channelRef.current?.postMessage("changed");
        router.refresh();
      } else if (result.status === "unavailable") {
        setReservationError("This event is full or the selected reservation is no longer available.");
        router.refresh();
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

  async function withdrawRsvp() {
    if (savingRef.current) return;
    savingRef.current = true;
    ++checkVersion.current;
    setSaving(true);
    setSavingAction("withdraw");
    setActionError(null);
    try {
      const result = await withdrawSpot(eventCode);
      if (result.status !== "withdrawn" && result.status !== "not-found") {
        throw new Error("Unexpected RSVP withdrawal result.");
      }
      setReservation(null);
      if (result.status === "not-found") setActionError("Your RSVP is no longer active.");
      channelRef.current?.postMessage("changed");
      router.refresh();
    } catch (error) {
      console.error("Could not withdraw reservation:", error);
      setActionError("Could not withdraw your RSVP. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
      setSavingAction(null);
    }
  }

  async function removeGuest() {
    if (savingRef.current) return;
    savingRef.current = true;
    ++checkVersion.current;
    setSaving(true);
    setSavingAction("remove-plus-one");
    setActionError(null);
    try {
      const result = await removePlusOne(eventCode);
      if (result.status === "reserved") {
        setReservation(result);
      } else if (result.status === "not-found") {
        setReservation(null);
        setActionError("Your RSVP is no longer active.");
      } else {
        throw new Error("Unexpected plus-one removal result.");
      }
      channelRef.current?.postMessage("changed");
      router.refresh();
    } catch (error) {
      console.error("Could not remove plus-one:", error);
      setActionError("Could not remove your +1. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
      setSavingAction(null);
    }
  }

  return (
    <Flex vertical gap={token.marginSM} style={{ boxSizing: "border-box", marginInline: "auto", maxWidth: 560, minHeight: "100vh", padding: token.paddingLG, width: "100%" }}>
      {celebration > 0 && (
        <div key={celebration} className={styles.confetti} aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece}
              className={styles.piece}
              style={{
                "--color": [token.colorPrimary, token.colorInfo, token.colorSuccess, token.colorError, token.colorText][piece % 5],
                "--delay": `${((piece * 17) % 29) * 0.05}s`,
                "--drift": `${(piece % 7 - 3) * 15}px`,
                "--duration": `${2.4 + (piece % 5) * 0.16}s`,
                "--left": `${((piece * 137) % 1000) / 10}%`,
                "--rotation": `${(piece % 2 === 0 ? 1 : -1) * (360 + (piece % 4) * 90)}deg`,
              }}
            />
          ))}
        </div>
      )}
      {clipboardUnavailable && (
        <Alert
          type="warning"
          showIcon
          message="The event was saved, but its ID could not be copied automatically."
          description="Use the copy button below or select the ID and copy it manually."
        />
      )}
      {event.isCreator && !event.canceled && (
        <Flex justify="end">
          <Button size="small" icon={<EditOutlined />} onClick={() => router.push(`/${eventCode}/edit`)}>Manage event</Button>
        </Flex>
      )}
      <Typography.Title level={2} style={{ margin: 0, overflowWrap: "anywhere" }}>{event.eventName}</Typography.Title>
      {event.canceled && <Alert type="warning" showIcon title="This event has been canceled." description="New RSVPs are no longer accepted." />}
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>Date</Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>{event.eventTime} - {event.eventDate}</Typography.Paragraph>
      </div>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>Description</Typography.Title>
        <Typography.Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{event.eventDescription}</Typography.Paragraph>
      </div>
      {!event.canceled && reservation && reservation.acceptedEventInformation && (
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Accepted Event Information</Typography.Title>
          <Typography.Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{reservation.acceptedEventInformation}</Typography.Paragraph>
        </div>
      )}
      <section aria-labelledby="attendees-heading">
        <Typography.Title id="attendees-heading" level={4} style={{ margin: 0 }}>
          RSVPs{" "}
          <span aria-live="polite" aria-atomic="true" style={{ fontSize: token.fontSize }}>
            {event.eventAttendanceType === "open"
              ? `(${event.reservedCount} ${event.reservedCount === 1 ? "spot" : "spots"} filled, no limit)`
              : `(${event.reservedCount}/${event.maximumAllowed} spots filled)`}
          </span>
        </Typography.Title>
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
      {!event.canceled && actionError && <Alert type="error" showIcon title={actionError} closable onClose={() => setActionError(null)} />}
      {!event.canceled && (reservationCheck === "loading" ? (
        <Typography.Paragraph>Checking your RSVP...</Typography.Paragraph>
      ) : reservationCheck === "error" ? (
        <Alert
          type="error"
          showIcon
          title="Could not check your RSVP."
          description="Try again before making or withdrawing a reservation."
          action={<Button onClick={() => { setReservationCheck("loading"); checkReservation(); }}>Retry</Button>}
        />
      ) : reservation ? (
        <Flex vertical gap={token.marginSM}>
          <Typography.Text>Your RSVP: {reservation.name}{reservation.guestCount === 2 ? " (w/ +1)" : ""}</Typography.Text>
          {reservation.guestCount === 2 && (
            <Button onClick={removeGuest} disabled={saving} loading={savingAction === "remove-plus-one"}>Remove +1</Button>
          )}
          <Button danger onClick={withdrawRsvp} disabled={saving} loading={savingAction === "withdraw"}>Withdraw RSVP</Button>
        </Flex>
      ) : (
        <Flex justify="center" style={{ paddingTop: token.paddingLG }}>
          <Button
            type="primary"
            size="large"
            icon={isFull ? null : <SmileOutlined />}
            disabled={isFull}
            onClick={() => setRsvpOpen(true)}
            style={{ height: 56, paddingInline: 32, fontSize: token.fontSizeHeading4 }}
          >
            {isFull ? "Event Full" : "RSVP now!"}
          </Button>
        </Flex>
      ))}
      <Modal title="RSVP" open={rsvpOpen && !event.canceled} onCancel={() => { if (!saving) setRsvpOpen(false); }} closable={!saving} mask={{ closable: !saving }} footer={null} centered>
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
