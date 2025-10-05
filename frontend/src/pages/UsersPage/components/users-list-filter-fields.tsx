import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormField, FormControl } from "@/components/ui/form";

interface UserListFilterFieldsProps {
    isLoading?: boolean;
}

export const UserListFilterFields = ({ isLoading }: UserListFilterFieldsProps) => (
    <>
        <FormField
            name="name"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="name-filter">Nome</Label>
                    <FormControl>
                        <Input
                            id="name-filter"
                            placeholder="Buscar por nome"
                            {...field}
                            onChange={(e) => {
                                field.onChange(e);
                            }}
                        />
                    </FormControl>
                </FormItem>
            )}
        />

        <FormField
            // control={form.control}
            disabled={isLoading}
            name="role"
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="role-filter">Cargo</Label>
                    <Select
                        value={field.value}
                        onValueChange={(value) => {
                            field.onChange(value);
                        }}
                    >
                        <FormControl>
                            <SelectTrigger id="role-filter" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="USER">Usuário</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />

        <FormField
            // control={form.control}
            disabled={isLoading}
            name="active"
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="active-filter">Status</Label>
                    <Select
                        value={field.value}
                        onValueChange={(value) => {
                            field.onChange(value);
                        }}
                    >
                        <FormControl>
                            <SelectTrigger id="active-filter" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    </>
)
