import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Button, Typography } from "@mui/material";
import MessageService from "../../../services/MessageService";
import { setSubmitted, setError } from "../slice";
import { retrieveSubmitted, retrieveError } from "../selector";

export default function ContactForm() {
  const dispatch = useDispatch();
  const submitted = useSelector(retrieveSubmitted);
  const error = useSelector(retrieveError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(""));
    try {
      const messageService = new MessageService();
      await messageService.createMessage({ name, email, message });
      dispatch(setSubmitted(true));
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      dispatch(setError("Failed to send message. Please try again."));
    }
  };

  if (submitted) {
    return (
      <div className="contact-success">
        <Typography variant="h6">Message sent!</Typography>
        <Typography color="text.secondary">
          We'll get back to you soon.
        </Typography>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <TextField
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        fullWidth
        multiline
        rows={4}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained">
        Send message
      </Button>
    </form>
  );
}
