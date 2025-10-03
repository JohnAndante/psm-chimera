import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

import { useLogin } from "./hooks";
import { LoginHeader, LoginFooter, ErrorAlert, AbstractBackground } from "./components";
import { cn } from "@/lib/utils";

/**
 * Página de login do sistema
 * Organizada com separação de responsabilidades
 */
export default function LoginPage() {
    const { form, isLoading, apiError, onSubmit } = useLogin();

    return (
        <div className="relative flex flex-col gap-8 justify-center items-center h-screen shadow-md w-full bg-primary overflow-hidden">
            {/* Background abstrato */}
            <AbstractBackground />

            <div className="relative z-10 flex flex-col gap-8 justify-center items-center h-screen shadow-md w-full">
                <LoginHeader />

                <Card className="w-full max-w-md shadow-2xl shadow-primary/20 bg-gray-300/60 backdrop-blur-sm border border-accent/30">

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Erro da API */}
                                {apiError && <ErrorAlert error={apiError} />}

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-black">
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="seu@email.com"
                                                    disabled={isLoading}
                                                    className="bg-transparent border border-gray-200 text-gray-900"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-black">
                                                Senha
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="senha"
                                                    disabled={isLoading}
                                                    className="bg-transparent border border-gray-200 text-gray-900"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Remember Me */}
                                <FormField
                                    control={form.control}
                                    name="remember"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between">
                                            <FormLabel className="text-sm font-medium text-black">
                                                Lembrar de mim
                                            </FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-white",
                                        "active:scale-[0.98] active:duration-75",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                    )}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        'Entrar'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <LoginFooter />
            </div>
        </div>

    );
}
