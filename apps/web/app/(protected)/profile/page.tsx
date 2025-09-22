"use client";
import { useState, useEffect } from "react";
import { showErrorNotification, showSuccessNotification } from "@repo/ui";
import { ProfileCard } from "./components/ProfileCard";
import { AccountInfoCard } from "./components/AccountInfoCard";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          full_name: data.profile.full_name || "",
          email: data.profile.email || "",
        });
      } else {
        showErrorNotification("Error al cargar el perfil");
      }
    } catch (error) {
      showErrorNotification("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        showSuccessNotification("Perfil actualizado exitosamente");
      } else {
        const error = await response.json();
        showErrorNotification(error.error || "Error al actualizar perfil");
      }
    } catch (error) {
      showErrorNotification("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y preferencias de cuenta.
        </p>
      </div>

      <div className="space-y-8">
        <ProfileCard
          formData={formData}
          onFormDataChange={setFormData}
          onSave={handleSave}
          saving={saving}
        />

        <AccountInfoCard profile={profile} />
      </div>
    </div>
  );
}