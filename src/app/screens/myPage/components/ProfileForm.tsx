import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Button, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import UserService from "../../../services/UserService";
import { useGlobals } from "../../../hooks/useGlobals";
import { setProfile } from "../slice";
import { retrieveProfile } from "../selector";

export default function ProfileForm() {
  const dispatch = useDispatch();
  const { setAuthMember } = useGlobals();
  const profile = useSelector(retrieveProfile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userService = new UserService();
      const updated = await userService.updateMyProfile({
        _id: profile!._id,
        name,
        phone,
      });
      dispatch(setProfile(updated));
      setAuthMember(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.log("Error updating profile:", err);
    }
  };

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).getFullYear();

  return (
    <div className="profile-wrapper">
      <div className="profile-banner">
        <div className="profile-avatar-large">{name.charAt(0)}</div>
        <div>
          <div className="profile-name">{name}</div>
          <div className="profile-since">Member since {memberSince}</div>
        </div>
      </div>

      <div className="profile-info-card">
        <div className="info-row">
          <PhoneIcon className="info-icon" />
          <span>{phone}</span>
        </div>
        <div className="info-row">
          <MailIcon className="info-icon" />
          <span>{profile.email}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="profile-form">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Save changes
        </Button>
        {saved && <Typography className="saved-msg">Saved!</Typography>}
      </form>
    </div>
  );
}
