import { Request, Response } from 'express';
import { NotificationChannelService } from '../services/notificationChannel.service';
import { NotificationChannelFilters, NotificationChannelType } from '../types/notification.type';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class NotificationChannelController {
  // GET /api/v1/notifications/channels
  static getAll(req: AuthenticatedRequest, res: Response) {
    const filters: NotificationChannelFilters = {};

    // Aplicar filtros da query string
    if (req.query.type && typeof req.query.type === 'string') {
      const validTypes = Object.values(NotificationChannelType);
      if (validTypes.includes(req.query.type as NotificationChannelType)) {
        filters.type = req.query.type as NotificationChannelType;
      }
    }

    if (req.query.active !== undefined) {
      filters.active = req.query.active === 'true';
    }

    if (req.query.search && typeof req.query.search === 'string') {
      filters.search = req.query.search;
    }

    NotificationChannelService.getAllChannels(filters)
      .then(channels => {
        res.json({
          message: channels.length > 0 ? 'Canais de notificação encontrados' : 'Nenhum canal de notificação encontrado',
          data: channels
        });
      })
      .catch(error => {
        console.error('Erro ao buscar canais de notificação:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar canais de notificação'
        });
      });
  }

  // GET /api/v1/notifications/channels/:id
  static getById(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    NotificationChannelService.getChannelById(id)
      .then(channel => {
        if (!channel) {
          return res.status(404).json({
            error: 'Canal de notificação não encontrado'
          });
        }
        res.json({
          message: 'Canal de notificação encontrado',
          data: channel
        });
      })
      .catch(error => {
        console.error('Erro ao buscar canal de notificação:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao buscar canal de notificação'
        });
      });
  }

  // POST /api/v1/notifications/channels
  static create(req: AuthenticatedRequest, res: Response) {
    // Dados já foram validados pelo middleware NotificationValidator
    const channelData = req.body;

    // Verificar se nome já existe
    NotificationChannelService.checkNameExists(channelData.name)
      .then(nameExists => {
        if (nameExists) {
          return res.status(409).json({
            error: 'Já existe um canal de notificação com esse nome'
          });
        }

        // Validar configuração específica do tipo
        const configValidation = NotificationChannelService.validateChannelConfig(
          channelData.type,
          channelData.config
        );
        if (configValidation) {
          return res.status(400).json({
            error: `Configuração inválida: ${configValidation}`
          });
        }

        // Criar canal
        NotificationChannelService.createChannel(channelData)
          .then(newChannel => {
            res.status(201).json({
              message: 'Canal de notificação criado com sucesso',
              data: newChannel
            });
          })
          .catch(error => {
            console.error('Erro ao criar canal de notificação:', error);
            res.status(500).json({
              error: 'Erro interno do servidor ao criar canal de notificação'
            });
          });
      })
      .catch(error => {
        console.error('Erro ao verificar nome existente:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao verificar nome'
        });
      });
  }

  // PUT /api/v1/notifications/channels/:id
  static update(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Dados já foram validados pelo middleware NotificationValidator
    const updateData = req.body;

    // Se está atualizando o nome, verificar se já existe
    if (updateData.name) {
      NotificationChannelService.checkNameExists(updateData.name, id)
        .then(nameExists => {
          if (nameExists) {
            return res.status(409).json({
              error: 'Já existe um canal de notificação com esse nome'
            });
          }

          // Se tem configuração nova, validar
          if (updateData.config) {
            // Se tem tipo novo, usar ele; senão buscar o atual
            if (updateData.type) {
              const configValidation = NotificationChannelService.validateChannelConfig(
                updateData.type,
                updateData.config
              );
              if (configValidation) {
                return res.status(400).json({
                  error: `Configuração inválida: ${configValidation}`
                });
              }
            }
          }

          // Atualizar canal
          NotificationChannelService.updateChannel(id, updateData)
            .then(updatedChannel => {
              res.json({
                message: 'Canal de notificação atualizado com sucesso',
                data: updatedChannel
              });
            })
            .catch(error => {
              if (error.message && error.message.includes('not found')) {
                return res.status(404).json({
                  error: 'Canal de notificação não encontrado'
                });
              }
              console.error('Erro ao atualizar canal de notificação:', error);
              res.status(500).json({
                error: 'Erro interno do servidor ao atualizar canal de notificação'
              });
            });
        })
        .catch(error => {
          console.error('Erro ao verificar nome existente:', error);
          res.status(500).json({
            error: 'Erro interno do servidor ao verificar nome'
          });
        });
    } else {
      // Se não está atualizando nome, seguir direto
      if (updateData.config && updateData.type) {
        const configValidation = NotificationChannelService.validateChannelConfig(
          updateData.type,
          updateData.config
        );
        if (configValidation) {
          return res.status(400).json({
            error: `Configuração inválida: ${configValidation}`
          });
        }
      }

      NotificationChannelService.updateChannel(id, updateData)
        .then(updatedChannel => {
          res.json({
            message: 'Canal de notificação atualizado com sucesso',
            data: updatedChannel
          });
        })
        .catch(error => {
          if (error.message && error.message.includes('not found')) {
            return res.status(404).json({
              error: 'Canal de notificação não encontrado'
            });
          }
          console.error('Erro ao atualizar canal de notificação:', error);
          res.status(500).json({
            error: 'Erro interno do servidor ao atualizar canal de notificação'
          });
        });
    }
  }

  // DELETE /api/v1/notifications/channels/:id
  static delete(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Verificar se há jobs usando este canal
    NotificationChannelService.checkChannelHasLinkedJobs(id)
      .then(hasLinkedJobs => {
        if (hasLinkedJobs) {
          return res.status(400).json({
            error: 'Não é possível excluir canal que está sendo usado por jobs'
          });
        }

        // Deletar canal (soft delete)
        NotificationChannelService.deleteChannel(id)
          .then(() => {
            res.json({
              message: 'Canal de notificação removido com sucesso'
            });
          })
          .catch(error => {
            if (error.message && error.message.includes('not found')) {
              return res.status(404).json({
                error: 'Canal de notificação não encontrado'
              });
            }
            console.error('Erro ao remover canal de notificação:', error);
            res.status(500).json({
              error: 'Erro interno do servidor ao remover canal de notificação'
            });
          });
      })
      .catch(error => {
        console.error('Erro ao verificar jobs vinculados:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao verificar jobs vinculados'
        });
      });
  }

  // POST /api/v1/notifications/channels/:id/test
  static testNotification(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Dados já foram validados pelo middleware NotificationValidator
    const { message } = req.body;

    NotificationChannelService.testNotification(id, message)
      .then(testResult => {
        res.json({
          message: 'Teste de notificação realizado com sucesso',
          data: testResult
        });
      })
      .catch(error => {
        if (error.message === 'Canal de notificação não encontrado') {
          return res.status(404).json({
            error: 'Canal de notificação não encontrado'
          });
        }
        if (error.message === 'Canal de notificação está inativo') {
          return res.status(400).json({
            error: 'Canal de notificação está inativo'
          });
        }
        console.error('Erro ao testar notificação:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao testar notificação'
        });
      });
  }
}
