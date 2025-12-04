"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCreateAccount } from "@/hooks/useCreateAccount";
import { useCheckAccountExistence } from "@/hooks/useCheckAccountExistence";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CreateAccountPage = () => {
    const router = useRouter();
    const { hasAccount, isLoading: checkingAccount } = useCheckAccountExistence();
    const [formData, setFormData] = useState({
        username: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Redirect to dashboard if user already has an account
    useEffect(() => {
        if (!checkingAccount && hasAccount) {
            console.log("User already has an account, redirecting to dashboard...");
            router.push("/dashboard");
        }
    }, [hasAccount, checkingAccount, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        };

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { createAccount, isCreating, error } = useCreateAccount();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            createAccount({
                user_name: formData.username,
            }).then(() => {
                console.log("Account created successfully");
                router.push("/dashboard");
            }).catch((error) => {
                console.error("Error creating account:", error);
            });
        }
    };

    // Show loading state while checking account existence
    if (checkingAccount) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-4 repeated-square-bg">
                <Card className="w-full max-w-md border-4 border-black shadow-[12px_12px_0px_0px_rgba(26,115,232,1)] bg-white rounded-2xl overflow-hidden">
                    <CardContent className="!px-6 !py-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-[#1A73E8]" />
                        <p className="text-lg font-black uppercase text-center">Checking Account Status...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Don't render the form if user already has an account (will redirect)
    if (hasAccount) {
        return null;
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#F5EFFF] repeated-square-bg">
            <Card className="w-full max-w-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(26,115,232,1)] bg-white rounded-2xl overflow-hidden">
                {/* Header */}
                <CardHeader className="!px-6 !py-6 border-b-4 border-black bg-[#1A73E8]">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 border-4 border-black bg-[#4FC3F7] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl">
                            <UserPlus className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-black uppercase tracking-wide text-white">
                                Create Account
                            </CardTitle>
                            <p className="text-sm font-bold text-white/90 mt-1">
                                Join ChronoVault and secure your files
                            </p>
                        </div>
                    </div>
                </CardHeader>

                {/* Form */}
                <CardContent className="!px-6 !py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-black uppercase tracking-wide text-black"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <User className="w-5 h-5 text-black" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-4 py-3 border-4 rounded-lg ${errors.username ? "border-red-500" : "border-black"
                                        } bg-white font-bold text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(26,115,232,1)] transition-shadow`}
                                    placeholder="Enter your username"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs font-bold text-red-500 uppercase">
                                    {errors.username}
                                </p>
                            )}
                        </div>


                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-14 border-4 border-black bg-[#1A73E8] text-white hover:bg-[#0B2A4A] font-black uppercase text-lg tracking-wide shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] transition-all duration-100 rounded-lg cursor-pointer"
                            disabled={isCreating}
                        >
                            {isCreating ? "Creating..." : "Create ChronoVault Account"}
                            {isCreating && <Loader2 className="w-6 h-6 ml-2 animate-spin" />}
                            <ArrowRight className="w-6 h-6 ml-2" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateAccountPage;
