"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Save, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { tRole, tVerified } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  changePassword,
  fetchProfile,
  updateProfile,
} from "@/lib/services/profile-service";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatDateForInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function ProfileView() {
  const { data: session, update: updateSession } = useSession();
  const { data: profile, loading, error, refetch } = useAdminFetch(
    () => fetchProfile(),
    [],
  );

  const [profileFields, setProfileFields] = useState({
    name: "",
    phone: "",
    avatar: "",
    dateOfBirth: "",
    gender: "",
  });
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setProfileFields({
      name: profile.name || session?.user?.name || "",
      phone: profile.phone || "",
      avatar: profile.avatar || "",
      dateOfBirth: formatDateForInput(profile.dateOfBirth),
      gender: profile.gender || "",
    });
  }, [profile, session?.user?.name]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      await updateProfile({
        name: profileFields.name.trim(),
        phone: profileFields.phone.trim(),
        avatar: profileFields.avatar.trim(),
        dateOfBirth: profileFields.dateOfBirth || null,
        gender: profileFields.gender,
      });
      await updateSession();
      await refetch();
      toast.success("Đã cập nhật hồ sơ");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể cập nhật hồ sơ"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();

    if (passwordFields.password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }

    if (passwordFields.password !== passwordFields.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword(passwordFields);
      setPasswordFields({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
      toast.success("Đã đổi mật khẩu");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể đổi mật khẩu"));
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <AdminLoading label="Đang tải hồ sơ..." />;
  }

  if (error || !profile) {
    return (
      <AdminError
        message={error || "Không tải được hồ sơ"}
        onRetry={refetch}
      />
    );
  }

  const roleLabel = session?.user?.role ? tRole(session.user.role) : "—";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Hồ sơ của tôi"
        description="Xem và cập nhật thông tin tài khoản quản trị của bạn"
      />

      <section className="admin-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10">
            {profileFields.avatar ? (
              <Image
                src={profileFields.avatar}
                alt={profileFields.name || "Avatar"}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-keyshop-muted">
                <UserCircle className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">
              {profile.name || session?.user?.name}
            </p>
            <p className="text-sm text-keyshop-muted">{profile.email}</p>
            <p className="mt-1 text-xs text-keyshop-blue">{roleLabel}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-keyshop-line pt-6 sm:grid-cols-2">
          <InfoItem label="Email xác minh" value={tVerified(profile.verify_email)} />
          <InfoItem
            label="Xác thực 2 lớp"
            value={profile.twoFactorEnabled ? "Đã bật" : "Chưa bật"}
          />
        </dl>
      </section>

      <section className="admin-card p-6">
        <h2 className="text-lg font-semibold text-white">Thông tin cá nhân</h2>
        <form onSubmit={handleProfileSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Họ và tên</Label>
            <Input
              id="profile-name"
              value={profileFields.name}
              onChange={(event) =>
                setProfileFields({ ...profileFields, name: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Số điện thoại</Label>
            <Input
              id="profile-phone"
              value={profileFields.phone}
              onChange={(event) =>
                setProfileFields({ ...profileFields, phone: event.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-avatar">URL ảnh đại diện</Label>
            <Input
              id="profile-avatar"
              type="url"
              value={profileFields.avatar}
              onChange={(event) =>
                setProfileFields({ ...profileFields, avatar: event.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-dob">Ngày sinh</Label>
            <Input
              id="profile-dob"
              type="date"
              value={profileFields.dateOfBirth}
              onChange={(event) =>
                setProfileFields({
                  ...profileFields,
                  dateOfBirth: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-gender">Giới tính</Label>
            <select
              id="profile-gender"
              value={profileFields.gender}
              onChange={(event) =>
                setProfileFields({ ...profileFields, gender: event.target.value })
              }
              className="admin-filter-select w-full"
            >
              <option value="">—</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu hồ sơ
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-card p-6">
        <h2 className="text-lg font-semibold text-white">Đổi mật khẩu</h2>
        <p className="mt-1 text-sm text-keyshop-muted">
          Email đăng nhập: <span className="text-white">{profile.email}</span> (không
          đổi tại đây)
        </p>
        <form onSubmit={handlePasswordSubmit} className="mt-4 grid max-w-xl gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={passwordFields.currentPassword}
              onChange={(event) =>
                setPasswordFields({
                  ...passwordFields,
                  currentPassword: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={passwordFields.password}
              onChange={(event) =>
                setPasswordFields({
                  ...passwordFields,
                  password: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={passwordFields.confirmPassword}
              onChange={(event) =>
                setPasswordFields({
                  ...passwordFields,
                  confirmPassword: event.target.value,
                })
              }
            />
          </div>
          <div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-keyshop-line/60 bg-white/[0.02] px-4 py-3">
      <dt className="text-xs text-keyshop-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
