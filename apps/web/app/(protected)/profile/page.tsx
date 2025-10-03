"use client";
import { useState, useEffect } from "react";
import { showErrorNotification, showSuccessNotification } from "@repo/ui";
import { ProfileCard } from "./components/ProfileCard";
import { AccountInfoCard } from "./components/AccountInfoCard";
import { Badge } from "../../../components/ui/Badge";
import { useLoading } from "../../../contexts/LoadingContext";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    showLoading();
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          full_name: data.profile.full_name,
          email: data.profile.email,
        });
      } else {
        showErrorNotification("Error al cargar el perfil");
      }
    } catch (error) {
      showErrorNotification("Error de conexión");
    } finally {
      hideLoading();
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

  if (!profile) {
    return null;
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

        <AccountInfoCard 
          title="Account Information"
          description="Details about your account and configuration."
          fields={[
            {
              label: "User ID",
              value: profile?.id || "N/A",
              type: "mono"
            },
            {
              label: "Account Status", 
              value: <Badge variant="success">Active</Badge>,
              type: "badge"
            }
          ]}
        />
      </div>
    </div>
  );
}
