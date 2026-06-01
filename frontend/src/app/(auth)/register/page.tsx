'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingStore } from '@/stores/onboardingStore';

// ---- schemas ----
const createSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const joinSchema = z.object({
  slugOrUrl: z.string().min(1, 'Please enter an invite link or company slug'),
});

type CreateFormData = z.infer<typeof createSchema>;
type JoinFormData = z.infer<typeof joinSchema>;
type Mode = 'choose' | 'create' | 'join';

// ---- icon ----
function UserPlusIcon() {
  return (
    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

// ---- sub-forms ----
function CreateForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const setPersonal = useOnboardingStore((s) => s.setPersonal);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = async (data: CreateFormData) => {
    setPersonal({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    router.push('/onboarding');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          type="text"
          label="First name"
          placeholder="John"
          error={errors.firstName?.message}
          autoComplete="given-name"
        />
        <Input
          {...register('lastName')}
          type="text"
          label="Last name"
          placeholder="Doe"
          error={errors.lastName?.message}
          autoComplete="family-name"
        />
      </div>

      <Input
        {...register('email')}
        type="email"
        label="Email address"
        placeholder="you@company.com"
        error={errors.email?.message}
        autoComplete="email"
      />

      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        type="password"
        label="Confirm password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Continue to setup
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}

function JoinForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = async (data: JoinFormData) => {
    // Extract last path segment as slug (handles both raw slug and full URL)
    const raw = data.slugOrUrl.trim();
    let slug: string;
    try {
      const url = new URL(raw);
      const parts = url.pathname.replace(/\/$/, '').split('/');
      slug = parts[parts.length - 1];
    } catch {
      // Not a URL — treat the whole value as a slug
      slug = raw.replace(/\/$/, '').split('/').pop() ?? raw;
    }

    if (!slug) {
      toast.error('Could not extract a valid slug from the provided input.');
      return;
    }

    router.push(`/join/${slug}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('slugOrUrl')}
        type="text"
        label="Invite link or company slug"
        placeholder="acme-corp  or  https://…/join/acme-corp"
        error={errors.slugOrUrl?.message}
        autoComplete="off"
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Find organisation
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}

// ---- main page ----
export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>('choose');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <UserPlusIcon />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'choose' && 'Get Started'}
            {mode === 'create' && 'Create a new company'}
            {mode === 'join' && 'Join an existing company'}
          </CardTitle>
          <CardDescription>
            {mode === 'choose' && 'How would you like to use AuditFlow?'}
            {mode === 'create' && 'Enter your details to set up your organisation'}
            {mode === 'join' && 'Enter your invite link or company slug'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === 'choose' && (
            <div className="space-y-3">
              <Button className="w-full" onClick={() => setMode('create')}>
                Create a new company
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMode('join')}>
                Join an existing company
              </Button>
              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {mode === 'create' && <CreateForm onBack={() => setMode('choose')} />}
          {mode === 'join'   && <JoinForm   onBack={() => setMode('choose')} />}

          {mode !== 'choose' && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
