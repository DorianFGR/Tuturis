import HiddenOnMobile from "@/components/HiddenOnMobile";
import VisibleOnMobile from "@/components/VisibleOnMobile";
import ComputerLanding from "@/components/landing/computer";
import Hero from "@/components/landing/hero";
import { getTranslations } from "next-intl/server";



export default async function Home() {
  const t = await getTranslations('HomePage');
  return (
    <>
      <Hero/>
    </>

  );
}
