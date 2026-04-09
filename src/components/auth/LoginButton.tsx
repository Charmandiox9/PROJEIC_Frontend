'use client';

export default function LoginButton() {
  const handleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    window.location.href = `${backendUrl}/projeic/api/auth/google`;
  };

  return (
    <button onClick={handleLogin}>
      Ingresar con Google
    </button>
  );
}