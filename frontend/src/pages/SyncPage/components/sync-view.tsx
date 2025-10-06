/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageContainer } from "@/components/layout/page-container";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SyncController } from "@/controllers/sync.controller";
import { useToast } from "@/hooks/use-toast";
import type { SyncConfiguration } from "@/types/sync";
import { Button } from "@/components/ui/button";

export default function SyncViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [config, setConfig] = useState<SyncConfiguration | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await SyncController.getSyncConfigById(Number(id));
                if (!cancelled) setConfig(data);
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

    if (isLoading) return (
        <PageContainer title="Carregando..." subtitle="Carregando configuração">
            <PageCard>
                <div>Carregando...</div>
            </PageCard>
        </PageContainer>
    );

    if (!config) return null;

    return (
        <PageContainer title={config.name} subtitle="Visualizar configuração de sincronização">
            <PageCard cardTitle="Configuração">
                <div className="space-y-3">
                    <div><strong>Descrição:</strong> {config.description || '-'}</div>
                    <div><strong>Ativa:</strong> {config.active ? 'Yes' : 'No'}</div>
                    <div><strong>Schedule:</strong> {config.schedule ? JSON.stringify(config.schedule) : '-'}</div>
                    <div><strong>Options:</strong> <pre className="bg-muted p-2 rounded text-sm">{JSON.stringify(config.options, null, 2)}</pre></div>
                    <div><strong>Source Integration:</strong> {config.source_integration?.name ?? '-'}</div>
                    <div><strong>Target Integration:</strong> {config.target_integration?.name ?? '-'}</div>
                    <div><strong>Notification Channel:</strong> {config.notification_channel?.name ?? '-'}</div>
                </div>
            </PageCard>

            <div className="mt-4 flex gap-2">
                <Button onClick={() => navigate(`/sincronizacoes/${config.id}/editar`)}>Editar</Button>
                <Button variant="outline" onClick={() => navigate('/sincronizacoes')}>Voltar</Button>
            </div>
        </PageContainer>
    );
}
