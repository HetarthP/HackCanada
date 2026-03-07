"use client";

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { Sparkles, Home, Library, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function CustomSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Video Library", href: "/library", icon: Library },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <Sidebar open={open} setOpen={setOpen} animate={true}>
            <SidebarBody className="bg-black border-r border-teal-900/30 justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <Logo open={open} />

                    <div className="mt-8 mb-6 relative">
                        <Link href="/create" className="block outline-none">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center justify-center gap-2 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold ${open ? 'w-full py-3 px-4' : 'w-12 h-12 p-0'}`}
                            >
                                <Plus className="w-5 h-5 flex-shrink-0" />
                                <motion.span
                                    className="whitespace-pre overflow-hidden"
                                    animate={{
                                        display: open ? "inline-block" : "none",
                                        opacity: open ? 1 : 0,
                                        width: open ? "auto" : 0
                                    }}
                                >
                                    Create
                                </motion.span>
                            </motion.button>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.href;
                            return (
                                <SidebarLink
                                    key={idx}
                                    link={{
                                        label: item.name,
                                        href: item.href,
                                        icon: (
                                            <div className={`flex items-center justify-center rounded-lg w-7 h-7 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-gray-400 group-hover/sidebar:text-white'}`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                        )
                                    }}
                                    className={isActive ? "bg-teal-500/10 !text-teal-400" : "hover:bg-white/5"}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto px-2">
                    {/* User profile section could go here */}
                </div>
            </SidebarBody>
        </Sidebar>
    );
}

function Logo({ open }: { open: boolean }) {
    return (
        <Link
            href="/dashboard"
            className="flex space-x-3 items-center text-sm py-1 relative z-20 outline-none mt-2 px-2"
        >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-black flex items-center justify-center p-[1px] flex-shrink-0">
                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
            </div>
            <motion.span
                animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                }}
                className="text-white font-bold text-xl tracking-tight whitespace-pre"
            >
                adswap
            </motion.span>
        </Link>
    );
}
