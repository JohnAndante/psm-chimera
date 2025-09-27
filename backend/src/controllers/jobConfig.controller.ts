import { Request, Response } from 'express';
import { jobConfigService } from '../services/jobConfig.service';
import { JobConfigurationFilters } from '../types/job.type';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class JobConfigurationController {
  // GET /api/v1/jobs/configurations
  static getAllJobs(req: AuthenticatedRequest, res: Response) {
    const filters: JobConfigurationFilters = {};

    // Aplicar filtros da query string
    if (req.query.active !== undefined) {
      filters.active = req.query.active === 'true';
    }

    if (req.query.job_type && typeof req.query.job_type === 'string') {
      filters.job_type = req.query.job_type as any;
    }

    if (req.query.integration_id && typeof req.query.integration_id === 'string') {
      const integrationId = parseInt(req.query.integration_id);
      if (!isNaN(integrationId)) {
        filters.integration_id = integrationId;
      }
    }

    if (req.query.search && typeof req.query.search === 'string') {
      filters.search = req.query.search;
    }

    jobConfigService.getAllJobs(filters)
      .then(jobs => {
        res.json({
          message: jobs.length > 0 ? 'Configurações de jobs encontradas' : 'Nenhuma configuração de job encontrada',
          data: jobs
        });
      })
      .catch(error => {
        console.error('Erro ao buscar configurações de jobs:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar configurações de jobs'
        });
      });
  }

  // GET /api/v1/jobs/configurations/:id
  static getJobById(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID da configuração de job deve ser um número válido'
      });
    }

    jobConfigService.getJobById(id)
      .then(job => {
        if (!job) {
          return res.status(404).json({
            error: 'Configuração de job não encontrada'
          });
        }
        res.json({
          message: 'Configuração de job encontrada',
          data: job
        });
      })
      .catch(error => {
        console.error('Erro ao buscar configuração de job:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar configuração de job'
        });
      });
  }

  // POST /api/v1/jobs/configurations
  static createJob(req: AuthenticatedRequest, res: Response) {
    // Dados já foram validados pelo middleware JobConfigValidator
    const jobData = req.body;

    // Verificar se nome já existe
    jobConfigService.checkNameExists(jobData.name)
      .then(nameExists => {
        if (nameExists) {
          return res.status(409).json({
            error: 'Já existe uma configuração de job com esse nome'
          });
        }

        // Se tem integration_id, verificar se existe
        if (jobData.integration_id) {
          jobConfigService.checkIntegrationExists(jobData.integration_id)
            .then(integrationExists => {
              if (!integrationExists) {
                return res.status(404).json({
                  error: 'Integração não encontrada'
                });
              }

              // Criar job
              jobConfigService.createJob(jobData)
                .then(newJob => {
                  res.status(201).json({
                    message: 'Configuração de job criada com sucesso',
                    data: newJob
                  });
                })
                .catch(error => {
                  console.error('Erro ao criar configuração de job:', error);
                  res.status(500).json({
                    error: 'Erro interno do servidor ao criar configuração de job'
                  });
                });
            })
            .catch(error => {
              console.error('Erro ao verificar integração:', error);
              res.status(500).json({
                error: 'Erro interno do servidor ao verificar integração'
              });
            });
        } else {
          // Criar job sem integração
          jobConfigService.createJob(jobData)
            .then(newJob => {
              res.status(201).json({
                message: 'Configuração de job criada com sucesso',
                data: newJob
              });
            })
            .catch(error => {
              console.error('Erro ao criar configuração de job:', error);
              res.status(500).json({
                error: 'Erro interno do servidor ao criar configuração de job'
              });
            });
        }
      })
      .catch(error => {
        console.error('Erro ao verificar nome existente:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao verificar nome'
        });
      });
  }

  // PUT /api/v1/jobs/configurations/:id
  static updateJob(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID da configuração de job deve ser um número válido'
      });
    }

    // Dados já foram validados pelo middleware JobConfigValidator
    const updateData = req.body;

    // Se está atualizando o nome, verificar se já existe
    if (updateData.name) {
      jobConfigService.checkNameExists(updateData.name, id)
        .then(nameExists => {
          if (nameExists) {
            return res.status(409).json({
              error: 'Já existe uma configuração de job com esse nome'
            });
          }

          // Se tem integration_id, verificar se existe
          if (updateData.integration_id) {
            jobConfigService.checkIntegrationExists(updateData.integration_id)
              .then(integrationExists => {
                if (!integrationExists) {
                  return res.status(404).json({
                    error: 'Integração não encontrada'
                  });
                }

                // Atualizar job
                jobConfigService.updateJob(id, updateData)
                  .then(updatedJob => {
                    res.json({
                      message: 'Configuração de job atualizada com sucesso',
                      data: updatedJob
                    });
                  })
                  .catch(error => {
                    if (error.message && error.message.includes('not found')) {
                      return res.status(404).json({
                        error: 'Configuração de job não encontrada'
                      });
                    }
                    console.error('Erro ao atualizar configuração de job:', error);
                    res.status(500).json({
                      error: 'Erro interno do servidor ao atualizar configuração de job'
                    });
                  });
              })
              .catch(error => {
                console.error('Erro ao verificar integração:', error);
                res.status(500).json({
                  error: 'Erro interno do servidor ao verificar integração'
                });
              });
          } else {
            // Atualizar job sem verificar integração
            jobConfigService.updateJob(id, updateData)
              .then(updatedJob => {
                res.json({
                  message: 'Configuração de job atualizada com sucesso',
                  data: updatedJob
                });
              })
              .catch(error => {
                if (error.message && error.message.includes('not found')) {
                  return res.status(404).json({
                    error: 'Configuração de job não encontrada'
                  });
                }
                console.error('Erro ao atualizar configuração de job:', error);
                res.status(500).json({
                  error: 'Erro interno do servidor ao atualizar configuração de job'
                });
              });
          }
        })
        .catch(error => {
          console.error('Erro ao verificar nome existente:', error);
          res.status(500).json({
            error: 'Erro interno do servidor ao verificar nome'
          });
        });
    } else {
      // Se não está atualizando nome, seguir direto
      if (updateData.integration_id) {
        jobConfigService.checkIntegrationExists(updateData.integration_id)
          .then(integrationExists => {
            if (!integrationExists) {
              return res.status(404).json({
                error: 'Integração não encontrada'
              });
            }

            jobConfigService.updateJob(id, updateData)
              .then(updatedJob => {
                res.json({
                  message: 'Configuração de job atualizada com sucesso',
                  data: updatedJob
                });
              })
              .catch(error => {
                if (error.message && error.message.includes('not found')) {
                  return res.status(404).json({
                    error: 'Configuração de job não encontrada'
                  });
                }
                console.error('Erro ao atualizar configuração de job:', error);
                res.status(500).json({
                  error: 'Erro interno do servidor ao atualizar configuração de job'
                });
              });
          })
          .catch(error => {
            console.error('Erro ao verificar integração:', error);
            res.status(500).json({
              error: 'Erro interno do servidor ao verificar integração'
            });
          });
      } else {
        jobConfigService.updateJob(id, updateData)
          .then(updatedJob => {
            res.json({
              message: 'Configuração de job atualizada com sucesso',
              data: updatedJob
            });
          })
          .catch(error => {
            if (error.message && error.message.includes('not found')) {
              return res.status(404).json({
                error: 'Configuração de job não encontrada'
              });
            }
            console.error('Erro ao atualizar configuração de job:', error);
            res.status(500).json({
              error: 'Erro interno do servidor ao atualizar configuração de job'
            });
          });
      }
    }
  }

  // DELETE /api/v1/jobs/configurations/:id
  static deleteJob(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID da configuração de job deve ser um número válido'
      });
    }

    jobConfigService.deleteJob(id)
      .then(() => {
        res.json({
          message: 'Configuração de job removida com sucesso'
        });
      })
      .catch(error => {
        if (error.message && error.message.includes('not found')) {
          return res.status(404).json({
            error: 'Configuração de job não encontrada'
          });
        }
        console.error('Erro ao remover configuração de job:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao remover configuração de job'
        });
      });
  }

  // POST /api/v1/jobs/configurations/:id/execute
  static executeJob(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID da configuração de job deve ser um número válido'
      });
    }

    jobConfigService.executeJob(id)
      .then(executionResult => {
        res.json({
          message: 'Execução do job iniciada com sucesso',
          data: executionResult
        });
      })
      .catch(error => {
        if (error.message === 'Configuração de job não encontrada') {
          return res.status(404).json({
            error: 'Configuração de job não encontrada'
          });
        }
        if (error.message === 'Configuração de job não está ativa') {
          return res.status(400).json({
            error: 'Configuração de job não está ativa'
          });
        }
        console.error('Erro ao executar job:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao executar job'
        });
      });
  }
}
