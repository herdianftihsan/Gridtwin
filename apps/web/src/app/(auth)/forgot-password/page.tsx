import { Suspense } from 'react';
import { AuthLayout } from '../../../components/auth/auth-layout';
import { ForgotPasswordForm } from '../../../components/auth/forgot-password-form';

export const metadata = {
  title: 'Reset Password | GridTwin AI',
  description: 'Reset your password to regain access to your GridTwin account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      backgroundImage="/images/auth/forgot-password-bg.webp"
      imageAlt="Commercial rooftop solar array overlooking evening skyline"
      quote="Secure access to your energy twin."
      subquote="Professional decision intelligence platform for evaluating climate-tech and grid investments."
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}