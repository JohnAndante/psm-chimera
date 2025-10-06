import { PageContainer } from "@/components/layout/page-container";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SyncController } from "@/controllers/sync.controller";
import { useToast } from "@/hooks/use-toast";
import type { SyncConfiguration, UpdateSyncConfigRequest } from "@/types/sync";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SyncEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [config, setConfig] = useState<SyncConfiguration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState<Partial<UpdateSyncConfigRequest>>({});

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await SyncController.getSyncConfigById(Number(id));
                if (!cancelled) {
                    setConfig(data);
                    setForm({
                        name: data.name,
                        description: data.description,
                        schedule_enabled: data.schedule_enabled,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        options: data.options as any,
                    });
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                toast.error('Erro ao carregar configuração', { description: err?.message });
                navigate('/sincronizacoes');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);
        try {
            const payload: UpdateSyncConfigRequest = {
                name: form.name,
                description: form.description,
                schedule_enabled: form.schedule_enabled,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                options: form.options as any,
            };
            await SyncController.updateSyncConfig(Number(id), payload);
            toast.success('Configuração atualizada');
            navigate('/sincronizacoes');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error('Erro ao salvar configuração', { description: err?.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <PageContainer title="Carregando..." subtitle="Carregando configuração">
            <PageCard>Carregando...</PageCard>
        </PageContainer>
    );

    if (!config) return null;

    return (
        <PageContainer title={`Editar ${config.name}`} subtitle="Editar sincronização">
            <PageCard>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={form.name ?? ''} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                    </div>

                    <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" value={form.description ?? ''} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch id="active" checked={form.schedule_enabled ?? false} onCheckedChange={(v) => setForm(prev => ({ ...prev, schedule_enabled: Boolean(v) }))} />
                        <Label htmlFor="active">Agendamento ativado</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
                        <Button type="reset" variant="outline" onClick={() => navigate('/sincronizacoes')}>Cancelar</Button>
                    </div>
                </form>
            </PageCard>
        </PageContainer>
    );
}
