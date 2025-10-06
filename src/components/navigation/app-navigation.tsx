"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { useRouter, usePathname, useParams } from "next/navigation";
import { getLanguagePath } from "@/lib/changeLanguage";
import { cn } from "@/lib/utils"
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { getUser } from "@/lib/auth-server";
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
  DialogTrigger,
} from "@/components/ui/dialog"

type NavItem = { title: string; href: string; description: string }

export function AppNavigation({ viewport = false, className }: { viewport?: boolean; className?: string }) {

  // Language change setup
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const t = useTranslations('app-navigation')
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);

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

  return (
    <div className="flex justify-between items-start w-full">
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
                    <Link href="" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">{t("itsFree")}</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t("itsFreeDesc")}</p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>{t("language")}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-2 p-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link 
                      href={getLanguagePath(pathname, currentLocale, "en")}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      English
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link 
                      href={getLanguagePath(pathname, currentLocale, "fr")}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      Français
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>{t("documentation")}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-2 p-2">
                <li>
                  <NavigationMenuLink asChild>
                    <a 
                      href="/Terms-of-Service.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {t('terms')}
                    </a>
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

export default AppNavigation