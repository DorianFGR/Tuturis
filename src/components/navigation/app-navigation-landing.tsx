"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

type NavItem = { title: string; href: string; description: string }

export function AppNavigationLanding({ viewport = false, className }: { viewport?: boolean; className?: string }) {

  // Language change setup
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const t = useTranslations('landingPage.hero');
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);

  const [user, setUser] = useState<{
      name: string
      email: string
      image?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      async function fetchUser() {
        try {
          const response = await fetch("/api/getUser")
          
          if (!response.ok) {
            setUser(null)
            return
          }
  
          const data = await response.json()
          setUser(data.user)
        } catch (error) {
          console.error(error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
  
      fetchUser()
    }, [])
  

  const components: NavItem[] = [
    {
      title: t('checkDataLeak'),
      href: "/haveibeenpwned",
      description: t('checkDataLeakDescription'),
    },
    {
      title: t('passwordStrength'),
      href: "/passChecker",
      description: t('passwordStrengthDescription'),
    },
  ];

  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className="flex justify-between items-center w-full gap-4">
      <NavigationMenu viewport={viewport} className={cn("", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
        <NavigationMenuTrigger className="!bg-[#212121] !text-white hover:!bg-[#212121] hover:!text-white data-[state=open]:!bg-[#212121]">{t("products")}</NavigationMenuTrigger>
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
        <NavigationMenuTrigger className="!bg-[#212121] !text-white hover:!bg-[#212121] hover:!text-white data-[state=open]:!bg-[#212121]">{t("pricing")}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[300px] gap-4">
          <li>
        <NavigationMenuLink asChild>
        <Link href="" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
          <div className="text-sm font-medium leading-none">{t("viewPricing")}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t("viewPricingDesc")}</p>
        </Link>
        </NavigationMenuLink>
          </li> 
          </ul>
        </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
        <NavigationMenuTrigger className="!bg-[#212121] !text-white hover:!bg-[#212121] hover:!text-white data-[state=open]:!bg-[#212121]">{t("contact")}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[200px] gap-2 p-2">
          <li>
        <NavigationMenuLink asChild>
        <button 
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left bg-transparent border-none cursor-pointer"
          onClick={() => setContactDialogOpen(true)}
        >
          <div className="text-sm leading-none font-medium">{t('contactUs')}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{t('contactUsDescription')}</p>
        </button>
        </NavigationMenuLink>
          </li>
          </ul>
        </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      </NavigationMenu>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("contactUs")}</DialogTitle>
            <DialogDescription>
              {t("contactUsDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email : 
                </Label>
                <p className="text-muted-foreground text-sm">contact@tuturis.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="github" className="text-sm font-medium">
                  GitHub :
                </Label>
                <a
                  href="https://github.com/DorianFGR/Tuturis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  https://github.com/DorianFGR/Tuturis
                </a>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <button
                type="button"
                className="border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md border bg-transparent px-3 text-sm font-medium"
              >
                {t("close")}
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
        <Link 
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default AppNavigationLanding