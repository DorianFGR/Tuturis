import React from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl";

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ContactDialog({ open, onOpenChange }: ContactDialogProps) {

    const t = useTranslations('landingPage.hero');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
    )
}