"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Image from "next/image";
import {
    Package,
    Plus,
    Trash2,
    DollarSign,
    ClipboardList,
    Sparkles,
    X,
    Loader2,
    ImageIcon,
    Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
    memory_id: string;
    name: string;
    cost: string;
    plan: string;
    status: string;
    image_url: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
        const res = await fetch("/auth/access-token");
        if (res.ok) {
            const data = await res.json();
            const token = data.token || data.accessToken;
            if (token) headers["Authorization"] = `Bearer ${token}`;
        }
    } catch {
        // Not authenticated
    }
    return headers;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [plan, setPlan] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/products/`, { headers });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch {
            // Silently fail — will show empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const headers = await getAuthHeaders();
            // remove Content-Type so the browser sets it to multipart/form-data
            delete headers["Content-Type"];

            const res = await fetch(`${API_URL}/api/products/upload-image`, {
                method: "POST",
                headers,
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
            } else {
                console.error("Image upload failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = ""; // reset file input
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/products/`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name: name.trim(),
                    cost: cost.trim() || "Not specified",
                    plan: plan.trim() || "Not specified",
                    status: "active",
                    image_url: imageUrl,
                }),
            });
            if (res.ok) {
                setName("");
                setCost("");
                setPlan("");
                setImageUrl("");
                setShowForm(false);
                fetchProducts();
            }
        } catch {
            // Error handling
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (memoryId: string) => {
        setDeletingId(memoryId);
        try {
            const headers = await getAuthHeaders();
            await fetch(`${API_URL}/api/products/${memoryId}`, {
                method: "DELETE",
                headers,
            });
            setProducts((prev) => prev.filter((p) => p.memory_id !== memoryId));
        } catch {
            // Error handling
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-screen w-full bg-black overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <BackgroundGradientAnimation
                        gradientBackgroundStart="rgb(5, 5, 5)"
                        gradientBackgroundEnd="rgb(10, 20, 30)"
                        firstColor="13, 148, 136"
                        secondColor="20, 184, 166"
                        thirdColor="30, 41, 59"
                        fourthColor="15, 118, 110"
                        fifthColor="2, 6, 23"
                        pointerColor="255, 255, 255"
                        size="100%"
                        blendingValue="hard-light"
                        interactive={false}
                        containerClassName="absolute inset-0 opacity-15"
                    />
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Products
                                </h1>
                            </div>
                            <p className="text-gray-400 text-sm ml-[52px]">
                                Track your marketing products — synced with Spotlight AI memory
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold text-sm shadow-[0_0_20px_rgba(20,184,166,0.25)] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product
                        </motion.button>
                    </div>

                    {/* Add Product Modal */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                                onClick={() => setShowForm(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full max-w-md mx-4 bg-gray-950 border border-teal-900/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(20,184,166,0.15)]"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-teal-400" />
                                            New Product
                                        </h2>
                                        <button
                                            onClick={() => setShowForm(false)}
                                            className="text-gray-500 hover:text-white transition-colors p-1"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAdd} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Nike Air Max Campaign"
                                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800 focus:border-teal-500/50 text-white placeholder-gray-600 outline-none text-sm transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Budget / Cost
                                            </label>
                                            <input
                                                type="text"
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                                placeholder="e.g. $5,000"
                                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800 focus:border-teal-500/50 text-white placeholder-gray-600 outline-none text-sm transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Marketing Plan
                                            </label>
                                            <textarea
                                                value={plan}
                                                onChange={(e) => setPlan(e.target.value)}
                                                placeholder="e.g. Social media + VPP in trending YouTube content"
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800 focus:border-teal-500/50 text-white placeholder-gray-600 outline-none text-sm transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Product Image
                                            </label>
                                            {imageUrl ? (
                                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-800">
                                                    <Image
                                                        src={imageUrl}
                                                        alt="Product preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageUrl("")}
                                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-300 hover:text-white transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative w-full px-4 py-4 rounded-xl bg-black/60 border border-dashed border-gray-700 hover:border-teal-500/50 text-gray-500 hover:text-teal-400 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    {uploadingImage ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            Upload Image (optional)
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !name.trim()}
                                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                                {submitting ? "Adding..." : "Add Product"}
                                            </button>
                                        </div>
                                    </form>

                                    <p className="text-[11px] text-gray-600 mt-4 text-center">
                                        Products are synced to Spotlight AI&apos;s memory automatically
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-4" />
                            <p className="text-sm">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center justify-center mb-6">
                                <Package className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No products yet
                            </h3>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                Add products here or tell Spotlight AI in the chat to
                                track a product — it&apos;ll appear here automatically.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Product
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product.memory_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="relative group"
                                >
                                    <div className="relative rounded-2xl border border-gray-800 bg-gray-950/80 backdrop-blur-xl p-5 hover:border-teal-900/60 transition-all duration-300 h-full flex flex-col">
                                        <GlowingEffect
                                            spread={20}
                                            glow={true}
                                            disabled={false}
                                            proximity={80}
                                            inactiveZone={0.01}
                                            borderWidth={1}
                                        />

                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-4 h-4 text-teal-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold text-sm leading-tight">
                                                        {product.name}
                                                    </h3>
                                                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                        product.status === "active"
                                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                                            : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                                                    }`}>
                                                        {product.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(product.memory_id)}
                                                disabled={deletingId === product.memory_id}
                                                className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                                title="Delete product"
                                            >
                                                {deletingId === product.memory_id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Product Image */}
                                        {product.image_url ? (
                                            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 border border-gray-800/50">
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-28 rounded-xl bg-gray-900/60 border border-gray-800/40 flex flex-col items-center justify-center mb-4">
                                                <ImageIcon className="w-6 h-6 text-gray-700 mb-1" />
                                                <span className="text-[10px] text-gray-600">No image</span>
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2.5">
                                                <DollarSign className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                                <span className="text-gray-300 text-sm">
                                                    {product.cost}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <ClipboardList className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                                    {product.plan}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center gap-1.5 text-[11px] text-gray-600">
                                            <Sparkles className="w-3 h-3" />
                                            Synced with Spotlight AI
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
