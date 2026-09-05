"use client";

import { useEffect, useState } from "react";

type Settings = {
    freePlanLimit: number;
    proPlanLimit: number;
};

export function AdminSettingsForm() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [savedMessage, setSavedMessage] = useState("");

    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch("/api/admin/settings");
                const data: Settings & { error?: string } = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Could not load settings.");
                }

                setSettings(data);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error ? error.message : "Could not load settings."
                );
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!settings) {
            return;
        }

        setSaving(true);
        setErrorMessage("");
        setSavedMessage("");

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            const data: { success?: boolean; error?: string } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not save settings.");
            }

            setSavedMessage("Saved.");
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not save settings."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="text-sm text-mute">Loading settings...</p>;
    }

    if (!settings) {
        return (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage || "Could not load settings."}
            </div>
        );
    }

    const fields: Array<{ key: keyof Settings; label: string }> = [
        { key: "freePlanLimit", label: "Free plan monthly limit" },
        { key: "proPlanLimit", label: "Pro plan monthly limit" }
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-xl">
            <div className="space-y-5">
                {fields.map((field) => (
                    <div key={field.key}>
                        <label className="mb-2 block text-sm font-semibold">
                            {field.label}
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={settings[field.key]}
                            onChange={(event) =>
                                setSettings((current) =>
                                    current
                                        ? {
                                            ...current,
                                            [field.key]: Number(event.target.value)
                                        }
                                        : current
                                )
                            }
                            className="w-full border border-line bg-paper px-4 py-3 outline-none focus:border-ink"
                        />
                    </div>
                ))}
            </div>

            {errorMessage && (
                <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {savedMessage && (
                <div className="mt-5 border border-line bg-surface px-4 py-3 text-sm">
                    {savedMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={saving}
                className="mt-6 border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition duration-300 ease-studio hover:bg-paper hover:text-ink disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save settings"}
            </button>
        </form>
    );
}
