'use client';

import { useT } from '@/hooks/useT';

export default function LoginButton() {
  const { t } = useT();
  const handleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    window.location.href = `${backendUrl}/projeic/api/auth/google`;
  };

  return (
    <button onClick={handleLogin}>
      {t('global.loginWithGoogle')}
    </button>
  );
}