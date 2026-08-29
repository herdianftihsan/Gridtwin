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
      <ForgotPasswordForm />
    </AuthLayout>
  );
}