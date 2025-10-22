import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { NotifierCreatedCommand } from '@src/app/event-sourcing/commands/notifierCreated.command';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, In, Repository } from 'typeorm';
import { AsyncForEach } from 'utils-friendly';
import { UserRoleService } from '../../user/services/userRole.service';
import { CreateNotifierDTO } from '../dtos';
import { UpdateNotificationStatusDTO } from '../dtos/notifiication/updateNotifierSeenStatus.dto';
import { Notifier } from '../entities/notifier.entity';
import { SmsService } from '../sms/services/sms.service';

@Injectable()
export class NotifierService extends BaseService<Notifier> {
  constructor(
    @InjectRepository(Notifier)
    public readonly _repo: Repository<Notifier>,
    private readonly userRoleService: UserRoleService,
    private readonly dataSource: DataSource,
    private readonly cmdBus: CommandBus,
    private readonly smsService: SmsService,
  ) {
    super(_repo);
  }

  async createOne(payload: CreateNotifierDTO) {
    //! Notification Create Start !//
    await this.cmdBus.execute(
      new NotifierCreatedCommand({
        data: Object.assign(new Notifier(), {
          title: payload?.title || `New notification for ${payload.type.toLocaleLowerCase()}!`,
          content: payload?.content,
          type: payload.type,
          user: payload?.user,
          data: {
            ...payload.data,
          },
          meta: {
            ...payload.meta,
          },
        }),
      }),
    );
    //! Notification Create end !//
    return this.createOneBase(payload);
  }

  async createNotifications(data: any, roleBased: boolean, roles?: string[]): Promise<void> {
    const payloads = [];

    if (!roleBased) {
      if (Array.isArray(data?.internalUser)) {
        data.internalUser.forEach((user) => {
          payloads.push({
            ...data,
            internalUser: user,
          });
        });
      } else {
        payloads.push(data);
      }
    } else {
      const users = await this.userRoleService.find({
        where: {
          role: {
            title: In(roles),
          },
        },
        relations: ['role', 'user'],
      });

      const toNotify = [
        ...(Array.isArray(data.internalUser) ? data.internalUser : [data.internalUser]),
        ...users?.map((u) => u?.user?.id),
      ];

      const uniqueToNotify = [...new Set(toNotify)];

      uniqueToNotify.forEach((user) => {
        payloads.push({
          ...data,
          internalUser: user,
        });
      });
    }

    await AsyncForEach(payloads, async (payload) => {
      await this.createOneBase(payload);
    });
  }

  async updateNotifiersSeenStatus(payload: UpdateNotificationStatusDTO, authUser: IAuthUser) {
    const queryRunner = await startTransaction(this.dataSource);

    try {
      const notifications = await this.find({
        where: { id: In(payload.ids), user: { id: authUser?.id } },
      });

      if (!notifications.length) throw new NotFoundException('Notification not found');

      await AsyncForEach(notifications, async (notification: Notifier) => {
        await queryRunner.manager.update(
          Notifier,
          { id: notification?.id },
          { isSeen: payload?.isSeen },
        );
      });
      await commitTransaction(queryRunner);

      return new SuccessResponse('Notification seen status updated successfully');
    } catch (err) {
      await rollbackTransaction(queryRunner);
      throw err;
    }
  }
}
