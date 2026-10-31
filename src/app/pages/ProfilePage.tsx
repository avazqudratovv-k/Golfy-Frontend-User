import React, { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { useLoader } from "../hooks/useMedia";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UserRole } from "../lib/enums";
import { apiError, imgUrl, initials } from "../lib/format";
import { Banner, FieldError } from "../components/ui";
import { PageHeader } from "../components/Motion";

const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const MAX_AVATAR = 5 * 1024 * 1024;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data: profile, loading, error, reload } = useLoader(() => authApi.profile(), []);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarErr, setAvatarErr] = useState("");
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<"server" | "tooMany" | "wrongPass" | "phoneUsed" | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setAvatarErr(t("profile.avatarType"));
    if (f.size > MAX_AVATAR) return setAvatarErr(t("profile.avatarSize"));
    setAvatarErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const errs = {
    name: !name.trim(),
    phone: !PHONE_RE.test(phone.trim()),
    newPass: next.length > 0 && next.length < 8,
    current: next.length > 0 && !current,
  };

  const save = async (ev: FormEvent) => {
    ev.preventDefault();
    setTried(true);
    setProblem(null);
    if (errs.name || errs.phone || errs.newPass || errs.current) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("phone", phone.trim());
      if (file) form.append("avatar", file);
      if (next) {
        form.append("password", next);
        form.append("currentPassword", current);
      }
      const updated = await authApi.updateProfile(form);
      setUser({ ...(user ?? updated), ...updated });
      setFile(null);
      setCurrent("");
      setNext("");
      setTried(false);
      toast(t("profile.saved"));
    } catch (err) {
      const { status, raw } = apiError(err);
      setProblem(status === 429 ? "tooMany" : status === 401 ? "wrongPass" : /phone/i.test(raw) && /already/i.test(raw) ? "phoneUsed" : "server");
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    try { await logout(); } catch {}
    navigate("/", { replace: true });
  };

  const avatar = preview ?? imgUrl(profile?.avatarUrl ?? user?.avatarUrl);

  if (loading && !profile) {
    return <main className="g-mainpage"><div className="g-wrap" style={{ maxWidth: 760 }} aria-busy="true"><div className="g-skel" style={{ height: 420 }} /></div></main>;
  }

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ maxWidth: 760, display: "grid", gap: 24 }}>
        <PageHeader
          title={t("profile.title")}
          subtitle={t("profile.subtitle")}
          actions={<button className="g-btn g-btn--secondary" type="button" onClick={doLogout}><i className="i i-logout" />{t("profile.logout")}</button>}
        />

        {error && (
          <Banner title={t("profile.loadFailed")} action={<button className="g-btn g-btn--secondary g-btn--sm" type="button" onClick={reload}>{t("common.retry")}</button>}>
            {t("profile.loadFailedText")}
          </Banner>
        )}
        {problem === "server" && <Banner title={t("profile.saveFailed")}>{t("bk.loadFailedText")}</Banner>}
        {problem === "tooMany" && <Banner title={t("apiError.tooManyRequests")} />}

        <form className="g-box" onSubmit={save} noValidate>
          <div className="g-row" style={{ gap: 16 }}>
            <span className={`g-avatar-lg${avatar ? " g-avatar-img" : ""}`} style={avatar ? { backgroundImage: `url("${avatar}")` } : undefined} role="img" aria-label={t("profile.avatarAria")}>
              {avatar ? "" : initials(name)}
            </span>
            <div style={{ display: "grid", gap: 6 }}>
              <span className="g-label">{t("profile.avatar")}</span>
              <label className="g-btn g-btn--secondary g-btn--sm g-filebtn">
                <i className="i i-up" />{t("profile.changePhoto")}
                <input type="file" accept="image/*" aria-label={t("profile.uploadAria")} onChange={pickAvatar} />
              </label>
              <span className="g-hint">{t("profile.avatarHint")}{file ? t("profile.avatarSaved") : ""}</span>
              {avatarErr && <span className="g-msg" role="alert"><i className="i i-alert" />{avatarErr}</span>}
            </div>
          </div>

          <div className="g-formgrid">
            <div className={`g-field${tried && errs.name ? " is-invalid" : ""}`}>
              <label className="g-label" htmlFor="pn">{t("profile.fullName")}</label>
              <input className="g-input" id="pn" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              {tried && errs.name && <FieldError>{t("profile.nameError")}</FieldError>}
            </div>
            <div className={`g-field${(tried && errs.phone) || problem === "phoneUsed" ? " is-invalid" : ""}`}>
              <label className="g-label" htmlFor="pp">{t("profile.phone")}</label>
              <input className="g-input g-num" id="pp" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setProblem(null); }} />
              {tried && errs.phone && <FieldError>{t("profile.phoneError")}</FieldError>}
              {problem === "phoneUsed" && <FieldError>{t("profile.phoneUsed")}</FieldError>}
            </div>
            <div className="g-field">
              <label className="g-label" htmlFor="pe">{t("profile.email")} <small>{t("profile.notEditable")}</small></label>
              <input className="g-input" id="pe" value={profile?.email ?? user?.email ?? ""} readOnly />
            </div>
            <div className="g-field">
              <label className="g-label" htmlFor="pr">{t("profile.role")} <small>{t("profile.notEditable")}</small></label>
              <input className="g-input" id="pr" value={(profile?.role ?? user?.role) === UserRole.ADMIN ? t("profile.roleAdmin") : t("profile.rolePlayer")} readOnly />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "grid", gap: 16 }}>
            <h2 style={{ fontSize: 19 }}>{t("profile.changePassword")}</h2>
            <div className="g-formgrid">
              <div className={`g-field${(tried && errs.current) || problem === "wrongPass" ? " is-invalid" : ""}`}>
                <label className="g-label" htmlFor="pc">{t("profile.currentPassword")}</label>
                <input className="g-input" id="pc" type="password" autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); setProblem(null); }} />
                {tried && errs.current && <FieldError>{t("profile.currentError")}</FieldError>}
                {problem === "wrongPass" && <FieldError>{t("profile.wrongPass")}</FieldError>}
              </div>
              <div className={`g-field${tried && errs.newPass ? " is-invalid" : ""}`}>
                <label className="g-label" htmlFor="pw">{t("profile.newPassword")}</label>
                <input className="g-input" id="pw" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
                <span className="g-hint">{t("profile.newHint")}</span>
                {tried && errs.newPass && <FieldError>{t("profile.newError")}</FieldError>}
              </div>
            </div>
          </div>

          <div className="g-row" style={{ justifyContent: "flex-end" }}>
            <button className="g-btn g-btn--primary" type="submit" disabled={saving} aria-busy={saving}>
              {saving && <span className="g-spin" />}
              {saving ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
