"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { BsStars } from "react-icons/bs";

export default function AuthCallbackClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window === !"undefined") return;

        const token = searchParams.get("token");
        if (token) {
            Cookies.set("promtgov-token", token, { expires: 1 });
            router.replace("/documents");
        }
    }, [searchParams.toString(), router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div onClick={() => router.push("/")} className="flex text-8xl font-extrabold text-[#1d4ed8] cursor-pointer">
                PromptGov AI
                <BsStars size={40} />
            </div>
        </div>
    );
}
