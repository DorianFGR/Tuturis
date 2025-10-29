import AppNavigationLanding from "../navigation/app-navigation-landing";

export default function ComputerLanding() {

    return (
        <>
            <section className="w-full h-[92px] flex flex-row justify-between items-center pl-8 pr-8" style={{ backgroundColor: '#212121' }}>
                <div>
                    <h1 className="text-white text-4xl font-bold ml-[200px]" style={{ fontFamily: 'var(--font-inter)' }}>Tuturis</h1>
                </div>

                <div className="flex flex-row gap-4 items-center">

                    <AppNavigationLanding />
                    
                </div>
            </section>
        </>
    );

}