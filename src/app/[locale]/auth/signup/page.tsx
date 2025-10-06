import { SignUpForm } from "./signup-form";

export default function SignUpPage() {

    return(
        <div className="container flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md p-8 space-y-8 border rounded-lg">
                <h1 className="text-2xl font-bold text-center">Create an account</h1>
                <SignUpForm />
            </div>
        </div>
    )

}