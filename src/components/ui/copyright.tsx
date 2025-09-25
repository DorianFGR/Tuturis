import { useTranslations } from "next-intl"


export default function Copyright() {
    const t = useTranslations("copyright");
    return (
    <div className="fixed bottom-2 right-3 text-xs text-muted-foreground select-none">
        © {new Date().getFullYear()} Tuturis. {t('text')}
      </div>
    )
    }