"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type NavItem = { title: string; href: string; description: string }

export function AppNavigation({ viewport = false, className }: { viewport?: boolean; className?: string }) {
  const t = useTranslations('app-navigation')

  const components: NavItem[] = [
  {
    title: t('checkDataLeak'),
    href: "/haveibeenpwned",
    description:
      t('checkDataLeakDescription'),
  },
  /*
  {
    title: "Coming soon...",
    href: "/",
    description:
      "Be patient, we\u0026apos;re working hard to bring you more features!",
  },
  {
    title: "Coming soon..",
    href: "/",
    description:
      "Be patient, we\u0026apos;re working hard to bring you more features!",
  },
  {
    title: "Coming soon.",
    href: "/",
    description:
      "Be patient, we\u0026apos;re working hard to bring you more features!",
  },
  {
    title: "Coming soon",
    href: "/",
    description:
      "Be patient, we\u0026apos;re working hard to bring you more features!",
  },
    {
    title: "Coming soon....",
    href: "/",
    description:
      "Be patient, we\u0026apos;re working hard to bring you more features!",
  },
*/
]
  return (
    <NavigationMenu viewport={viewport} className={cn("", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t('Home')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">Tuturis</div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      {t('plateform')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title={t('whoWeAre')}>
                {t('discoverTuturis')}
              </ListItem>
              <ListItem href="/docs/installation" title={t('howToGetStarted')}>
                {t('learnHowToGetStarted')}
              </ListItem>
              <ListItem href="/docs/primitives/typography" title={t('contactUs')}>
                {t('contactUsDescription')}
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t("tools")}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t("pricing")}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="">
                    <div className="font-medium">{t("itsFree")}</div>
                    <div className="text-muted-foreground">{t("itsFreeDesc")}</div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t("language")}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">English</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">Français</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t("documentation")}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    {t('howtouse')}
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleIcon />
                    {t("FAQ")}
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#" className="flex-row items-center gap-2">
                    <CircleCheckIcon />
                    {t("terms")}
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default AppNavigation
