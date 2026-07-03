'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Moon, Save, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/lib/user-store';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useTheme } from 'next-themes';
import { profileSettingsSchema, passwordChangeSchema, type ProfileSettingsInput, type PasswordChangeInput } from '@/lib/validations';

export function SettingsTab() {
  const { settings, updateSettings } = useUserStore();
  const { locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [settingsForm, setSettingsForm] = useState<ProfileSettingsInput>({
    name: settings.name,
    email: settings.email,
    language: locale as 'en' | 'ar' | 'fr',
    theme: (theme as 'light' | 'dark') || 'dark',
  });
  const [settingsErrors, setSettingsErrors] = useState<Partial<Record<keyof ProfileSettingsInput, string>>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordChangeInput>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordChangeInput, string>>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSettingsSave = () => {
    const result = profileSettingsSchema.safeParse(settingsForm);
    if (!result.success) {
      const errors: Partial<Record<keyof ProfileSettingsInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileSettingsInput;
        errors[field] = issue.message;
      });
      setSettingsErrors(errors);
      return;
    }
    setSettingsErrors({});
    updateSettings(result.data);
    setLocale(result.data.language);
    setTheme(result.data.theme);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handlePasswordSave = () => {
    const result = passwordChangeSchema.safeParse(passwordForm);
    if (!result.success) {
      const errors: Partial<Record<keyof PasswordChangeInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PasswordChangeInput;
        errors[field] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-6">
          Profile Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
              <input
                type="text"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
              />
            </div>
            {settingsErrors.name && (
              <p className="text-xs text-red-500 mt-1">{settingsErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
              />
            </div>
            {settingsErrors.email && (
              <p className="text-xs text-red-500 mt-1">{settingsErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                Language
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
                <select
                  value={settingsForm.language}
                  onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value as 'en' | 'ar' | 'fr' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all appearance-none"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                Theme
              </label>
              <div className="relative">
                <Moon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
                <select
                  value={settingsForm.theme}
                  onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value as 'light' | 'dark' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all appearance-none"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={handleSettingsSave}
          >
            Save Changes
          </Button>
          {settingsSaved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-sage font-medium"
            >
              Saved!
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-6">
          Change Password
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30 hover:text-espresso dark:hover:text-cream transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30 hover:text-espresso dark:hover:text-cream transition-colors"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300 dark:text-cream/30" />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-espresso dark:text-cream text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
              />
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={handlePasswordSave}
          >
            Update Password
          </Button>
          {passwordSaved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-sage font-medium"
            >
              Password updated!
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
