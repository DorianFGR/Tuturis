import { useTranslations } from "next-intl";
import { signinForm as SigninForm } from "./signin-form";

export default function SignInPage() {
    const t = useTranslations('loginForm')

    return(
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">{t('signIn')}</h1>
                <SigninForm />
            </div>
        </div>
    )

}