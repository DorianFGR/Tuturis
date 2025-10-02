import { AppNavigation } from "@/components/navigation/app-navigation";
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker'
import Copyright from "@/components/ui/copyright";

export default function Home() {
  return (
    <>
      <AppNavigation className="mt-3 ml-4"/>
      <main className="flex items-center justify-center min-h-screen">
        <PasswordStrengthChecker />
      </main>
      <Copyright />
    </>
  )
}