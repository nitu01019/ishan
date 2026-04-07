'use client';

import { useState, useEffect, FormEvent } from 'react';

interface FormState {
  heroHeadline: string;
  heroSubtitle: string;
  heroCta: string;
  socialProofText: string;
  skills: string;
  footerName: string;
  footerTagline: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  bookingLink: string;
}

const EMPTY_FORM: FormState = {
  heroHeadline: '',
  heroSubtitle: '',
  heroCta: '',
  socialProofText: '',
  skills: '',
  footerName: '',
  footerTagline: '',
  linkedin: '',
  instagram: '',
  twitter: '',
  bookingLink: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config');
        if (!res.ok) {
          throw new Error('Failed to fetch configuration.');
        }
        const data = await res.json();
        const config = data.data ?? {};

        setForm({
          heroHeadline: config.hero?.headline ?? '',
          heroSubtitle: config.hero?.subtitle ?? '',
          heroCta: config.hero?.ctaText ?? '',
          socialProofText: config.hero?.socialProofText ?? '',
          skills: Array.isArray(config.skills)
            ? config.skills.join(', ')
            : '',
          footerName: config.footer?.name ?? '',
          footerTagline: config.footer?.tagline ?? '',
          linkedin: config.footer?.socials?.linkedin ?? '',
          instagram: config.footer?.socials?.instagram ?? '',
          twitter: config.footer?.socials?.twitter ?? '',
          bookingLink: config.bookingLink ?? '',
        });
      } catch {
        setError('Failed to load site configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      hero: {
        headline: form.heroHeadline,
        subtitle: form.heroSubtitle,
        ctaText: form.heroCta,
        socialProofText: form.socialProofText,
      },
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      footer: {
        name: form.footerName,
        tagline: form.footerTagline,
        socials: {
          linkedin: form.linkedin,
          instagram: form.instagram,
          twitter: form.twitter,
        },
      },
      bookingLink: form.bookingLink,
    };

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save configuration.');
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <p className="text-text-secondary">Loading settings...</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Configure your portfolio site content and links.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {success && (
        <p className="text-accent-green text-sm mb-4">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Hero Section
          </h2>
          <hr className="border-gray-700 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">
                Headline
              </label>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => updateField('heroHeadline', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">
                Subtitle
              </label>
              <textarea
                value={form.heroSubtitle}
                onChange={(e) => updateField('heroSubtitle', e.target.value)}
                rows={3}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none resize-vertical"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={form.heroCta}
                onChange={(e) => updateField('heroCta', e.target.value)}
                placeholder="e.g. Hire me"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Social Proof Text
              </label>
              <input
                type="text"
                value={form.socialProofText}
                onChange={(e) =>
                  updateField('socialProofText', e.target.value)
                }
                placeholder="e.g. Worked with 50+ clients"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
          <hr className="border-gray-700 mb-4" />
          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Skills (comma-separated)
            </label>
            <textarea
              value={form.skills}
              onChange={(e) => updateField('skills', e.target.value)}
              rows={3}
              placeholder="e.g. Premiere Pro, After Effects, DaVinci Resolve"
              className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none resize-vertical"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Footer</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Name
              </label>
              <input
                type="text"
                value={form.footerName}
                onChange={(e) => updateField('footerName', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Tagline
              </label>
              <textarea
                value={form.footerTagline}
                onChange={(e) => updateField('footerTagline', e.target.value)}
                rows={2}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none resize-vertical"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Social Links
          </h2>
          <hr className="border-gray-700 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => updateField('instagram', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={form.twitter}
                onChange={(e) => updateField('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Booking */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Booking</h2>
          <hr className="border-gray-700 mb-4" />
          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Booking Link
            </label>
            <input
              type="url"
              value={form.bookingLink}
              onChange={(e) => updateField('bookingLink', e.target.value)}
              placeholder="https://calendly.com/..."
              className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent-green text-black font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
