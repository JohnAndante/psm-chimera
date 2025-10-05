import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormField, FormControl } from "@/components/ui/form";

interface StoreListFilterFieldsProps {
    isLoading?: boolean;
}

export const StoreListFilterFields = ({ isLoading }: StoreListFilterFieldsProps) => (
    <>
        <FormField
            name="name"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="name-filter">Nome da Loja</Label>
                    <FormControl>
                        <Input
                            id="name-filter"
                            placeholder="Buscar por nome."
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
            name="registration"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="registration-filter">Registro</Label>
                    <FormControl>
                        <Input
                            id="registration-filter"
                            placeholder="Buscar por registro"
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
            name="active"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="active-filter">Status</Label>
                    <Select
                        {...field}
                        onValueChange={(value) => {
                            field.onChange(value);
                        }}
                    >
                        <FormControl>
                            <SelectTrigger id="active-filter" className="w-full">
                                <SelectValue placeholder="Selecionar status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="true">Ativa</SelectItem>
                            <SelectItem value="false">Inativa</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    </>
);
