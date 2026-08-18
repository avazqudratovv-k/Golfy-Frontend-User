import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import ProfileForm from "./components/ProfileForm";
import RecentBookingsSummary from "./components/RecentBookingsSummary";
import GolfIllustration from "./components/GolfIllustration";
import { setProfile } from "./slice";
import UserService from "../../services/UserService";
import "../../../css/myPage.css";

export default function MyPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetch = async () => {
      try {
        const userService = new UserService();
        const result = await userService.getMyProfile();
        dispatch(setProfile(result));
      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    };
    fetch();
  }, [dispatch]);

  return (
    <div className="my-page-layout">
      <div className="my-page-main">
        <ProfileForm />
        <div className="divider" />
        <RecentBookingsSummary />
      </div>
      <GolfIllustration />
    </div>
  );
}
