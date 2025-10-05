import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export const ChannelListFilterFields = ({ isLoading }: { isLoading: boolean }) => (
    <>
        <FormField
            name="name"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="name-filter">Nome</Label>
                    <FormControl>
                        <Input id="name-filter" placeholder="Digite o nome do canal" {...field} />
                    </FormControl>
                </FormItem>
            )}
        />

        <FormField
            name="type"
            disabled={isLoading}
            render={({ field }) => (
                <FormItem>
                    <Label htmlFor="role-filter">Tipo</Label>
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
                            <SelectItem value="TELEGRAM">Telegram</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />

        <FormField
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
);
