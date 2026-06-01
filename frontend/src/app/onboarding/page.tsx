'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import Step1CompanyInfo from '@/components/onboarding/Step1CompanyInfo';
import Step2Divisions from '@/components/onboarding/Step2Divisions';
import Step3Departments from '@/components/onboarding/Step3Departments';
import Step4Roles from '@/components/onboarding/Step4Roles';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';

export default function OnboardingPage() {
  const step = useOnboardingStore((s) => s.step);
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
