'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('READER');
  const [nid, setNid] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const passwordValid = PASSWORD_REGEX.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!passwordValid) {
      toast.error('Password does not meet requirements');
      return;
    }
   if (phoneError || (phone && !/^[0-9+\-\s()]+$/.test(phone))) {
  setPhoneError('Only numbers are acceptable');
  toast.error('Please fix the phone number');
  return;
} 
// Validate role-specific required fields
if (role === 'AUTHOR' || role === 'PUBLISHER') {
  if (!phone) {
    toast.error('Phone number is required');
    return;
  }
  if (!nid) {
    toast.error('NID upload is required');
    return;
  }
  if (!selfie) {
    toast.error('Selfie upload is required');
    return;
  }
}

if (role === 'AUTHOR') {
  if (!cv) {
    toast.error('CV upload is required');
    return;
  }
  if (!certificate) {
    toast.error('Educational certificate upload is required');
    return;
  }
}
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (role === 'AUTHOR' || role === 'PUBLISHER') {
        const uploadForm = new FormData();
        uploadForm.append('userId', data.userId);
        if (nid) uploadForm.append('nid', nid);
        if (selfie) uploadForm.append('selfie', selfie);
        if (role === 'AUTHOR') {
          if (cv) uploadForm.append('cv', cv);
          if (certificate) uploadForm.append('certificate', certificate);
        }

        await fetch('/api/auth/upload-verification', {
          method: 'POST',
          body: uploadForm,
        });
      }

      toast.success('Account created! Check your email to verify.');
      setSubmitted(true);
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Verification email sent');
      } else {
        toast.error(data.error || 'Failed to resend');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setResending(false);
    }
  };

  const isVerifiedRole = role === 'AUTHOR' || role === 'PUBLISHER';
  const isAuthor = role === 'AUTHOR';

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#14B8A6]/10 mb-5">
            <Mail className="h-7 w-7 text-[#14B8A6]" />
          </div>
          <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
            Check your email
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">
            We sent a verification link to <strong className="text-[#1A1D1E]">{email}</strong>.
            Click it to activate your account. The link expires in 24 hours.
          </p>

          <div className="p-3 rounded-lg bg-[#F5F2EC] text-xs text-[#6B7280] mb-5 text-left">
            <p>Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Check your spam / junk folder</li>
              <li>Make sure the email is spelled correctly</li>
              <li>Wait a minute, then try resending</li>
            </ul>
          </div>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full border border-[#E5E7EB] hover:bg-[#F5F2EC] text-[#1A1D1E] py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <Link href="/login">
            <button className="w-full mt-3 text-sm text-[#14B8A6] hover:underline">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-center mb-2">
          Create Account
        </h1>
        <p className="text-center text-[#6B7280] text-sm mb-6">
          Enter your information
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="mt-1 w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
              className="mt-1 w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                placeholder="Enter your password"
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition ${touched && !passwordValid
                    ? 'border-[#DC2626] focus:ring-[#DC2626]/40 focus:border-[#DC2626]'
                    : touched && passwordValid
                      ? 'border-[#16A34A] focus:ring-[#16A34A]/40 focus:border-[#16A34A]'
                      : 'border-[#E5E7EB] focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D1E] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.key}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? 'text-[#16A34A]' : 'text-[#6B7280]'
                        }`}
                    >
                      {passed ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <X className="h-3 w-3 shrink-0" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            {touched && !passwordValid && password.length === 0 && (
              <p className="mt-2 text-xs text-[#DC2626]">Password is required</p>
            )}
            {touched && !passwordValid && password.length > 0 && (
              <p className="mt-2 text-xs text-[#DC2626]">
                Password doesn&apos;t meet all requirements above
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]">
              I want to join as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
            >
              <option value="READER">Reader</option>
              <option value="AUTHOR">Author</option>
              <option value="PUBLISHER">Publisher</option>
            </select>
          </div>

          {isVerifiedRole && (
            <>
              <div>
  <label className="block text-sm font-medium text-[#1A1D1E]">
    Phone Number
  </label>
  <input
    type="tel"
    value={phone}
    onChange={(e) => {
      const val = e.target.value;
      setPhone(val);
      // Allow digits, spaces, +, -, (, )
      const valid = /^[0-9+\-\s()]*$/.test(val);
      if (!valid) {
        setPhoneError('Only numbers are acceptable');
      } else {
        setPhoneError('');
      }
    }}
    required
    placeholder="+880 1XXX-XXXXXX"
    className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
      phoneError
        ? 'border-[#DC2626] focus:ring-[#DC2626]/40 focus:border-[#DC2626]'
        : 'border-[#E5E7EB] focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]'
    }`}
  />
  {phoneError && (
    <p className="mt-1 text-xs text-[#DC2626]">{phoneError}</p>
  )}
</div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D1E]">
                  NID Upload
                </label>
                <input
  type="file"
  accept="image/*"
  required
  onChange={(e) => setNid(e.target.files?.[0] || null)}
  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-xs hover:file:opacity-90 cursor-pointer"
/>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D1E]">
                  Organization License Upload
                </label>
                <input
  type="file"
  accept="image/*"
  required
  onChange={(e) => setSelfie(e.target.files?.[0] || null)}
  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-xs hover:file:opacity-90 cursor-pointer"
/>
              </div>

              {isAuthor && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1D1E]">
                      CV / Resume (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      onChange={(e) => setCv(e.target.files?.[0] || null)}
                      className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-xs hover:file:opacity-90 cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Upload your CV or resume as PDF.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A1D1E]">
                      Educational Certificate (Image)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                      className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-xs hover:file:opacity-90 cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Upload a photo of your educational certificate.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || (touched && !passwordValid)}
            className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-[#6B7280]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#14B8A6] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function setPhoneError(arg0: string) {
  throw new Error('Function not implemented.');
}
