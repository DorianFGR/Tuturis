"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation"
import toast from "react-hot-toast";
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function forgetPasswordPage() {

    const router = useRouter();
    const t = useTranslations('forgetPassword')

    async function onSubmit(formData: FormData) {
        const email = formData.get('email');
        await authClient.forgetPassword(
            {
                email: String(email),
                redirectTo: "/auth/reset-password"
            },
            {
                onSuccess:() => {
                    router.push(`/auth/verify?email=${email}`);
                    router.refresh()
                },
                onError: (error) => {
                    toast.error(error.error.message);
                }
            }
        )
    }
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-8 border rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center">{t('resetYourPassword')}</h1>
                <div className={cn("flex flex-col gap-6", )}>
                    <form action={onSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <a
                                href="../../../"
                                className="flex flex-col items-center gap-2 font-medium"
                                >
                                <div className="flex size-8 items-center justify-center rounded-md">
                                </div>
                                <span className="sr-only">Tuturis.</span>
                                </a>
                                <h1 className="text-xl font-bold">{t('inputEmail')}</h1>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    placeholder="tuturis@tuturis.com"
                                />
                            </Field>
                            <Field>
                                <Button type="submit">{t('input')}</Button>
                            </Field>
                            <FieldDescription>
                                <a href="./signin">{t('cancel')}</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </div>
        </div>
    </div>
  )
}