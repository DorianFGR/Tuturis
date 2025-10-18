"use client"

import { authClient } from "@/lib/auth-client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useTranslations } from "next-intl";


export default function forgetPasswordPage() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const t = useTranslations('reset-password')
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');
    

    async function onSubmit(formData: FormData) {
        const password = formData.get('password') as string;


        if (!token){

            router.push(`/auth/forget-password`);
            toast.error(t('errors.invalidOrExpiredToken'));
            return;
        }

        await authClient.resetPassword(
            {
                newPassword: String(password),
                token,
            },
            {
                onSuccess:() => {
                    router.push(`/auth/signin`);
                    toast.success("Password reset successful, you can now log in with your new password");
                },
                onError: (error) => {
                    toast.error(error.error.message);
                }
            }
        )
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('errors.passwordTooShort'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('errors.passwordsDontMatch'));
            return;
        }

        const formData = new FormData();
        formData.append('password', password);
        await onSubmit(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">{t('resetYourPassword')}</h1>
                <div className={cn("flex flex-col gap-6", )}>
                    <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <CardDescription>
                            {t('inputEmail')}
                        </CardDescription>
                        <Field>
                        <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            placeholder="••••••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        </Field>
                        <Field>
                        <FieldLabel htmlFor="confirmPassword">{t('rePassword')}</FieldLabel>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            placeholder="••••••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        </Field>
                        {error && (
                        <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Field>
                        <Button type="submit">{t('resetPasswordButton')}</Button>
                        </Field>
                    </FieldGroup>
                    </form>
                </div>
            </div>
            </div>
    )
}