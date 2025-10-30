import React from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ContactDialog from '../contactDialog'


interface MobileBurgerMenuProps {
    onClose: () => void
}

export default function MobileBurgerMenu({ onClose }: MobileBurgerMenuProps){
    const t = useTranslations('landingPage.hero');
    const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
    return(
    <>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors animate-in slide-in-from-top duration-300"
            >
                <X className="h-8 w-8" />
            </button>
            <nav className="flex flex-col gap-8 text-center animate-in slide-in-from-bottom duration-500">
            <Link href="#" className="text-black text-2xl font-semibold">
                → {t("products")}
            </Link>
            <Link href="#" className="text-black text-2xl font-semibold">
                → {t("pricing")}
            </Link>
            <button onClick={() => setContactDialogOpen(true)} className="text-black text-2xl font-semibold">
                → {t("contact")}
            </button>
            <Link href="/auth/signin" className="text-black text-2xl font-semibold">
                → {t("login")}
            </Link>
            <Link href="/auth/signup" className="text-black text-2xl font-semibold">
                → {t("join")}
            </Link>
            </nav>
        </div>
        <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </>
    )
}