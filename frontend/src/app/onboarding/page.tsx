'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { betaInviteApi } from '@/lib/api';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import Step1CompanyInfo from '@/components/onboarding/Step1CompanyInfo';
import Step2Divisions from '@/components/onboarding/Step2Divisions';
import Step3Departments from '@/components/onboarding/Step3Departments';
import Step4Roles from '@/components/onboarding/Step4Roles';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';
import { Loader2, CheckCircle } from 'lucide-react';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { step, betaInviteValidated, betaInviteCode, setBetaInviteCode, setBetaInviteValidated, reset } = useOnboardingStore();

  useEffect(() => {
    const code = searchParams.get('beta_invite') || searchParams.get('invite_code');
    if (code && !betaInviteValidated && betaInviteCode !== code) {
      const validateInvite = async () => {
        try {
          const res = await betaInviteApi.validateCode(code);
          const data = res.data?.data;
          if (data.valid) {
            setBetaInviteCode(code);
            setBetaInviteValidated(true);
          }
        } catch {
          // Invalid code, just continue normal flow
        }
      };
      validateInvite();
    }
  }, [searchParams, betaInviteCode, betaInviteValidated, setBetaInviteCode, setBetaInviteValidated]);

  if (step === 5) return <OnboardingComplete />;

  return (
    <OnboardingLayout step={step}>
      {step === 1 && <Step1CompanyInfo />}
      {step === 2 && <Step2Divisions />}
      {step === 3 && <Step3Departments />}
      {step === 4 && <Step4Roles />}
    </OnboardingLayout>
  );
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('beta_invite') || searchParams.get('invite_code');
  const { betaInviteValidated, betaInviteCode } = useOnboardingStore();

  if (code && !betaInviteValidated && betaInviteCode !== code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Validating invitation...</h2>
          <p className="text-gray-500">Please wait while we verify your beta invite code.</p>
        </div>
      </div>
    );
  }

  return <OnboardingContent />;
}