import { Request, Response } from 'express';
import { notificationChannelService } from '../services/notificationChannel.service';
import { NotificationChannelData, NotificationChannelFilters, NotificationChannelType } from '../types/notification.type';

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

    notificationChannelService.getAllChannels(filters)
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

    notificationChannelService.getChannelById(id)
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
    notificationChannelService.checkNameExists(channelData.name)
      .then(nameExists => {
        if (nameExists) {
          return res.status(409).json({
            error: 'Já existe um canal de notificação com esse nome'
          });
        }

        // Validar configuração específica do tipo
        const configValidation = notificationChannelService.validateChannelConfig(
          channelData.type,
          channelData.config
        );
        if (configValidation) {
          return res.status(400).json({
            error: `Configuração inválida: ${configValidation}`
          });
        }

        // Criar canal
        notificationChannelService.createChannel(channelData)
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
    const updateData = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Verifica se canal existe
    notificationChannelService.getChannelById(id)
      .then(async existingChannel => {
        if (!existingChannel) {
          return res.status(404).json({
            error: 'Canal de notificação não encontrado'
          });
        }


        // Se está atualizando o nome, verificar se já existe
        if (updateData.name) {
          const nameExists = await notificationChannelService.checkNameExists(updateData.name, id);
          if (nameExists) {
            return res.status(409).json({
              error: 'Já existe um canal de notificação com esse nome'
            });
          }
        }

        // Se tem configuração nova, validar
        if (updateData.config) {
          const typeToValidate = updateData.type || (existingChannel as NotificationChannelData).type;

          const configValidation = notificationChannelService.validateChannelConfig(
            typeToValidate,
            updateData.config
          );

          if (configValidation) {
            return res.status(400).json({
              error: `Configuração inválida: ${configValidation}`
            });
          }
        }

        // Atualizar canal
        const updatedChannel = await notificationChannelService.updateChannel(id, updateData);
        return res.json({
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


    notificationChannelService.updateChannel(id, updateData)
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
  // DELETE /api/v1/notifications/channels/:id
  static async delete(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Verificar se canal existe
    const existingChannel = await notificationChannelService.getChannelById(id);
    if (!existingChannel) {
      return res.status(404).json({
        error: 'Canal de notificação não encontrado'
      });
    }

    // Verificar se há jobs usando este canal
    const hasLinkedJobs = await notificationChannelService.checkChannelHasLinkedJobs(id);
    if (hasLinkedJobs) {
      return res.status(400).json({
        error: 'Não é possível excluir canal que está sendo usado por um trabalho'
      });
    }

    // Deletar canal (soft delete)
    return notificationChannelService.deleteChannel(id)
      .then(() => {
        res.json({
          message: 'Canal de notificação excluído com sucesso'
        });
      })
      .catch(error => {
        console.error('Erro ao remover canal de notificação:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao remover canal de notificação'
        });
      });
  }

  // POST /api/v1/notifications/channels/:id/test
  static async testNotification(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID do canal de notificação deve ser um número válido'
      });
    }

    // Verificar se canal existe
    const existingChannel = await notificationChannelService.getChannelById(id);
    if (!existingChannel) {
      return res.status(404).json({
        error: 'Canal de notificação não encontrado'
      });
    }

    // Verificar se canal está ativo
    if (existingChannel.active === false) {
      return res.status(400).json({
        error: 'Canal de notificação está inativo'
      });
    }

    // Dados já foram validados pelo middleware NotificationValidator
    const { message } = req.body;

    notificationChannelService.testNotification(id, message)
      .then(testResult => {
        res.json({
          message: 'Teste de notificação realizado com sucesso',
          data: testResult
        });
      })
      .catch(error => {
        console.error('Erro ao testar notificação:', error);
        res.status(500).json({
          error: 'Erro interno do servidor ao testar notificação'
        });
      });
  }
}
