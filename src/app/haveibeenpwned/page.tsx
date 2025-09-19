import { AppNavigation } from "@/components/navigation/app-navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link";
// Removed Button/Input imports; using native elements for now
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

export default function Page() {
  return(
    <>
      <AppNavigation className="mt-3 ml-4" />

      <Dialog>

      <form>
        <div className="flex justify-center p-4 mt-120">
          <DialogTrigger asChild>
            <ShimmerButton
              type="button"
              className="shadow-2xl mt-10 flex h-16 w-full max-w-lg items-center justify-center"
            >
              Check if your email has been pwned
            </ShimmerButton>
          </DialogTrigger>
        </div>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check if your email has been pwned</DialogTitle>
            <DialogDescription>
              Enter your email address below to see if it has been compromised in a data breach.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="mail-1">Email</Label>
              <input
                id="mail-1"
                name="mail"   
                placeholder="info@tuturis.com"
                className="bg-background border-input ring-offset-background file:text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

                <div className="flex items-center gap-3">
                <Checkbox id="terms" />
                <Label htmlFor="terms">
                  Accept <Link href="/terms" className="underline">terms and conditions</Link>
                </Label>
                </div>
            
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md border bg-transparent px-3 text-sm font-medium">Cancel</button>
            </DialogClose>
            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 text-sm font-medium">Check if pwned</button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </>
  ) 
  
}
