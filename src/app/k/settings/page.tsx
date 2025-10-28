"use client";

import { useState } from "react";
import { SettingsTemplate } from "@/templates/SettingsTemplate";
import type { SettingsSection } from "@/components/organisms/k/SettingsSidebar";

interface InterfaceSettings {
  compactMode: boolean;
  animations: boolean;
  language: string;
  fontSize: number;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("theme");

  // Theme settings
  const [colorScheme, setColorScheme] = useState<"light" | "dark" | "auto">(
    "auto"
  );
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [savedColorScheme, setSavedColorScheme] = useState<
    "light" | "dark" | "auto"
  >("auto");
  const [savedAccentColor, setSavedAccentColor] = useState("#6366f1");

  // Interface settings
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(
    {
      compactMode: false,
      animations: true,
      language: "vi",
      fontSize: 14,
    }
  );

  // Check if theme has changes
  const hasThemeChanges =
    colorScheme !== savedColorScheme || accentColor !== savedAccentColor;

  const handleSaveTheme = () => {
    setSavedColorScheme(colorScheme);
    setSavedAccentColor(accentColor);
    console.log("Theme saved:", { colorScheme, accentColor });
    // In a real app, you would save to backend/localStorage here
  };

  const handleCancelTheme = () => {
    setColorScheme(savedColorScheme);
    setAccentColor(savedAccentColor);
  };

  const handleInterfaceSettingChange = <K extends keyof InterfaceSettings>(
    key: K,
    value: InterfaceSettings[K]
  ) => {
    setInterfaceSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    console.log("Interface setting changed:", { [key]: value });
    // Auto-save interface settings
  };

  return (
    <SettingsTemplate
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      colorScheme={colorScheme}
      accentColor={accentColor}
      onColorSchemeChange={setColorScheme}
      onAccentColorChange={setAccentColor}
      interfaceSettings={interfaceSettings}
      onInterfaceSettingChange={handleInterfaceSettingChange}
      onSaveTheme={handleSaveTheme}
      onCancelTheme={handleCancelTheme}
      hasThemeChanges={hasThemeChanges}
    />
  );
}
