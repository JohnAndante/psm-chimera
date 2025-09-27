import { Request, Response } from 'express';
import { JobExecutionService } from '../services/jobExec.service';
import { JobExecutionFilters, ExecutionStatus } from '../types/job.type';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class JobExecutionController {
  // GET /api/v1/jobs/executions
  static getExecutions(req: AuthenticatedRequest, res: Response) {
    const filters: JobExecutionFilters = {};

    // Aplicar filtros da query string
    if (req.query.job_config_id && typeof req.query.job_config_id === 'string') {
      const jobConfigId = parseInt(req.query.job_config_id);
      if (!isNaN(jobConfigId)) {
        filters.job_config_id = jobConfigId;
      }
    }

    if (req.query.status && typeof req.query.status === 'string') {
      const validStatuses = Object.values(ExecutionStatus);
      if (validStatuses.includes(req.query.status as ExecutionStatus)) {
        filters.status = req.query.status as ExecutionStatus;
      }
    }

    if (req.query.limit && typeof req.query.limit === 'string') {
      const limit = parseInt(req.query.limit);
      if (!isNaN(limit)) {
        filters.limit = limit;
      }
    }

    // Filtros de data
    if (req.query.started_after && typeof req.query.started_after === 'string') {
      const date = new Date(req.query.started_after);
      if (!isNaN(date.getTime())) {
        filters.started_after = date;
      }
    }

    if (req.query.started_before && typeof req.query.started_before === 'string') {
      const date = new Date(req.query.started_before);
      if (!isNaN(date.getTime())) {
        filters.started_before = date;
      }
    }

    if (req.query.finished_after && typeof req.query.finished_after === 'string') {
      const date = new Date(req.query.finished_after);
      if (!isNaN(date.getTime())) {
        filters.finished_after = date;
      }
    }

    if (req.query.finished_before && typeof req.query.finished_before === 'string') {
      const date = new Date(req.query.finished_before);
      if (!isNaN(date.getTime())) {
        filters.finished_before = date;
      }
    }

    // Validar filtros
    const validationError = JobExecutionService.validateExecutionFilters(filters);
    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    JobExecutionService.getAllExecutions(filters)
      .then(executions => {
        res.json({
          message: executions.length > 0 ? 'Execuções de jobs encontradas' : 'Nenhuma execução de job encontrada',
          data: executions
        });
      })
      .catch(error => {
        console.error('Erro ao buscar execuções de jobs:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar execuções de jobs'
        });
      });
  }

  // GET /api/v1/jobs/executions/:id
  static getExecutionById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'ID da execução deve ser fornecido'
      });
    }

    JobExecutionService.getExecutionById(id)
      .then(execution => {
        if (!execution) {
          return res.status(404).json({
            error: 'Execução de job não encontrada'
          });
        }
        res.json({
          message: 'Execução de job encontrada',
          data: execution
        });
      })
      .catch(error => {
        console.error('Erro ao buscar execução de job:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar execução de job'
        });
      });
  }

  // GET /api/v1/jobs/executions/:id/logs
  static getExecutionLogs(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'ID da execução deve ser fornecido'
      });
    }

    JobExecutionService.getExecutionLogs(id)
      .then(logs => {
        if (!logs) {
          return res.status(404).json({
            error: 'Execução de job não encontrada'
          });
        }
        res.json({
          message: 'Logs da execução encontrados',
          data: logs
        });
      })
      .catch(error => {
        console.error('Erro ao buscar logs da execução:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar logs da execução'
        });
      });
  }
}
