import { SignIn } from '@clerk/nextjs'

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const redirectUrl = searchParams?.redirect_url || '/home';
  return <SignIn afterSignInUrl={redirectUrl} />
}