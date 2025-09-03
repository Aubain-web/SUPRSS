import LoginForm  from "../../composants/login/loginForm.tsx"

export default function LoginPage() {
    return (
        <div className="min-h-screen grid place-items-center p-6">
            <div className="w-full max-w-md border rounded-2xl p-6 shadow">
                <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
                <LoginForm />
            </div>
        </div>
    )
}