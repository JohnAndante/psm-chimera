import { PageContainer } from "@/components/layout/page-container";
import { PageCard } from "@/components/layout/page-card";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SyncController } from "@/controllers/sync.controller";
import { useToast } from "@/hooks/use-toast";
import type { SyncExecution } from "@/types/sync";
import { Button } from "@/components/ui/button";

export default function SyncExecutionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [execution, setExecution] = useState<SyncExecution | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await SyncController.getSyncExecutionById(id as any);
                if (!cancelled) setExecution(data);
            } catch (err: any) {
                toast.error('Erro ao carregar execução', { description: err?.message });
                navigate('/sincronizacoes');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [id, navigate, toast]);

    if (isLoading) return (
        <PageContainer title="Carregando..." subtitle="Carregando execução">
            <PageCard>Carregando...</PageCard>
        </PageContainer>
    );

    if (!execution) return null;

    return (
        <PageContainer title={`Execução ${execution.id}`} subtitle="Detalhes da execução">
            <PageCard cardTitle="Resumo">
                <div>
                    <div><strong>Status:</strong> {execution.status}</div>
                    <div><strong>Started at:</strong> {execution.started_at}</div>
                    <div><strong>Finished at:</strong> {execution.finished_at ?? '-'}</div>
                    <div><strong>Summary:</strong> <pre className="bg-muted p-2 rounded text-sm">{JSON.stringify(execution.summary, null, 2)}</pre></div>
                    <div><strong>Logs:</strong><pre className="bg-muted p-2 rounded text-sm">{execution.execution_log ?? execution.error_message ?? '-'}</pre></div>
                </div>
            </PageCard>

            <div className="mt-4">
                <Button onClick={() => navigate('/sincronizacoes')}>Voltar</Button>
            </div>
        </PageContainer>
    );
}
