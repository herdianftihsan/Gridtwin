import { Suspense } from 'react';
import { AuthLayout } from '../../../components/auth/auth-layout';
import { RegisterForm } from '../../../components/auth/register-form';

export const metadata = {
  title: 'Create Account | GridTwin AI',
  description: 'Create an account to start simulating building energy investments.',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      backgroundImage="/images/auth/register-bg.webp"
      imageAlt="Rooftop solar panels under golden sunrise"
      quote="The Energy Decision Platform"
      subquote="Designed for precise financial and capacity trade-offs in modern building infrastructure."
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}