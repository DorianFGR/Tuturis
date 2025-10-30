"use client"

import { Menu } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '../ui/button'
import AppNavigationLanding from "../navigation/app-navigation-landing";
import MobileBurgerMenu from './mobileBurgerMenu'

export default function Hero(){
    const t = useTranslations('landingPage.hero');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return(
    <>
        <header className="flex block md:hidden">

            <div className="min-w-[220px] align-start ml-4 mt-4">
                <h1 className="text-2xl" style={{ fontFamily: 'var(--font-inter)' }}>Tuturis</h1>
            </div>
            <div className="flex-1 flex items-center justify-end mr-4 mt-4">
                <button onClick={() => setIsMenuOpen(true)}><Menu className="h-6 w-6 text-[#212121]" /></button>
            </div>
            <div className="absolute top-1/4 transform">
                <h1 className="text-5xl font-bold  leading-tight mx-5" style={{ fontFamily: 'var(--font-inter)' }}>
                    Cybersecurity, made simple and effective
                </h1>
                <p className="text-center mx-auto max-w-2xl mt-10" style={{ fontFamily: 'var(--font-inter)' }}>Tuturis protects your data 24/7 — so you can browse, work, and grow your business with confidence.</p>

            </div>
        </header>

        <header className='hidden md:block'>

            <nav className="flex items-center justify-between h-[92px] bg-[#212121] px-8">
                <div className="flex items-center gap-8 ml-20">
                    <h1 className="text-2xl text-white" style={{ fontFamily: 'var(--font-inter)' }}>Tuturis</h1>
                </div>
                <div className="flex items-center gap-5">
                    <AppNavigationLanding className="mr-15" />
                    <Link href="/auth/signin"><Button variant="outline">{t('login')}</Button></Link>
                    <Link href="/auth/signup"><Button variant="outline">{t('join')}</Button></Link>
                </div>
            </nav>
            <div className="relative mt-30 mb-20 px-4 pt-60 min-h-[1000px]">
                <Image src="/waves.svg" alt="Hero Image" fill className="object-cover -translate-y-4d0" />
                <h1 className="ml-50 text-6xl font-bold leading-tight max-w-4xl relative z-10 text-left" style={{ fontFamily: 'var(--font-inter)' }}>
                    {t('titleP1')}<br />{t('titleP2')}
                </h1>
                <p className="ml-50 max-w-2xl mt-6 text-sm text-gray-600 relative z-10 text-left" style={{ fontFamily: 'var(--font-inter)' }}>{t('subtitle')}</p>
            </div>
        </header>
        
        {isMenuOpen && <MobileBurgerMenu onClose={() => setIsMenuOpen(false)} />}
    
    </>
    )
}