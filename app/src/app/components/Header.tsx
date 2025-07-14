// app/components/Header.tsx
import AuthNav from './HeaderAuthNav';
import Link from "next/link";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-4 py-3 border-b">
            <Link href="/"> <h1 className="text-xl font-bold">Mini Event Manager</h1>
            </Link>
            <AuthNav/>
        </header>
    );
}
