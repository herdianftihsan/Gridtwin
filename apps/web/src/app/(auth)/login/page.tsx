import { AuthLayout } from '../../../components/auth/auth-layout';
import { LoginForm } from '../../../components/auth/login-form';

export const metadata = {
  title: 'Sign In | GridTwin AI',
  description: 'Sign in to access your building energy twin and investment workspace.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      backgroundImage="/images/auth/login-bg.webp"
      imageAlt="Rooftop solar installation at dusk over modern cityscape"
      quote="Make the energy decision before you make the investment."
      subquote="Model configurations, compare trade-offs, and understand the outcome before spending."
      telemetry={{
        status: 'ONLINE',
        generation: '45.8 kW',
        consumption: '21.3 kW',
        monthlyCost: 'Rp 4.500.000',
        newMonthlyCost: 'Rp 1.420.000',
        payback: '3.8 Years',
        co2Reduction: '-42.5%',
      }}
    >
      <LoginForm />
    </AuthLayout>
  );
}