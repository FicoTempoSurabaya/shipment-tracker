import { getRegularDrivers } from '@/lib/data';
import LoginPageClient from './LoginPageClient';

export default async function LoginPage() {
  const drivers = await getRegularDrivers();

  return <LoginPageClient drivers={drivers} />;
}