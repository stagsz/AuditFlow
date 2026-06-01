import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const STEP_LABELS = ['Company Info', 'Divisions', 'Departments', 'Roles'];

export default function OnboardingLayout({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Set up your company</CardTitle>
          <CardDescription>Step {step} of 4 — {STEP_LABELS[step - 1]}</CardDescription>
          <div className="flex gap-1 mt-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
