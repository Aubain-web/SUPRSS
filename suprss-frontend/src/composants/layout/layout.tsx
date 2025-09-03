import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <div className="min-h-screen flex">
            {/* Ici tu peux mettre une sidebar, un header… */}
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    )
}
