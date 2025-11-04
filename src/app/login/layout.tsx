// This layout is now handled by ProtectedLayout component
// Keeping this file empty to override root layout behavior
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

