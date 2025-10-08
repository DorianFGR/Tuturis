import { useTranslations } from "next-intl";
import { SignupForm } from "./signup-form";

export default function SignUpPage() {

    const t = useTranslations('signupForm')

    return(
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">{t('signup')}</h1>
                <SignupForm />
            </div>
        </div>
    )

}