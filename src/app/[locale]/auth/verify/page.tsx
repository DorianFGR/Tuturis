import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function VerifyPage(props: {searchParams: Promise<Record<string, string >>}) {

    const searchParams = await props.searchParams;
    const email = searchParams.email;

    const t = await getTranslations('verifyEmail')
    
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('checkYourEmail')}</CardTitle>
                    {email ? (
                        <CardDescription>
                           {t('weHaveSent')} <strong>{email}</strong>. {t('pleaseCheck')}
                        </CardDescription>
                    ) : null}
                </CardHeader>
                <CardContent>
                    <Link 
                        href="/auth/signin" 
                        className="text-sm text-primary hover:underline"
                    >
                        {t('notRecieved')}
                    </Link>
                </CardContent>
                <CardContent>
                    <Link 
                        href="/auth/signin" 
                        className="text-sm text-primary hover:underline"
                    >
                        {t('goBackLogin')}
                    </Link>
                </CardContent>
            </Card>
        </div>
    )

}