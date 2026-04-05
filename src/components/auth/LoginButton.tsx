'use client';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/projeic/api/auth/google';
  };

  return (
    <button onClick={handleLogin}>
      Ingresar con Google
    </button>
  );
}