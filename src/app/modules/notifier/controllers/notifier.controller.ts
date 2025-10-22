import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { CreateNotifierDTO, FilterNotifierDTO, FilterNotifierLogsDTO, SendNotifierDTO } from '../dtos';
import { UpdateNotificationStatusDTO } from '../dtos/notifiication/updateNotifierSeenStatus.dto';
import { Notifier } from '../entities/notifier.entity';
import { NotifierService } from '../services/notifier.service';
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
@ApiTags('Notifiers')
@ApiBearerAuth()
@Controller('notifiers')
export class NotifierController {
  RELATIONS = ['user'];
  constructor(private readonly service: NotifierService) { }
  
  @Get()
  async find(
    @Query() query: FilterNotifierDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse | Notifier[]> {
    query.user = { id: authUser?.id };
    return this.service.findAllBase(query);
  }

  @Get('logs')
  async findLogs(
    @Query() query: FilterNotifierLogsDTO,
  ): Promise<SuccessResponse | Notifier[]> {
    const q = {
      user: {
        id: query.user,
        userRoles: [{
          role: {
            id: query.role,
          },
        }],
        enrollments: [{
          batch: {
            id: query.batch,
          },
          batchSection: {
            id: query.batchSection,
          },
          course: {
            id: query.course,
          },
        }],
      },
    };
    
    if (!query.role) {
      delete q.user.userRoles;
    }
    
    if (!query.batch) {
      q.user.enrollments.forEach(enrollment => delete enrollment.batch);
    }
    
    if (!query.batchSection) {
      q.user.enrollments.forEach(enrollment => delete enrollment.batchSection);
    }
    
    if (!query.course) {
      q.user.enrollments.forEach(enrollment => delete enrollment.course);
    }

    if (!query.user) {
      delete q.user.id;
    }

    if (query.type) {
      q['type'] = query.type;
    }

    if (query.seen) {
      q['seen'] = query.seen;
    }

    if (query.from && query.to) {
      q['createdAt'] = Between(query.from, query.to);
    } else if (query.from) {
      q['createdAt'] = MoreThanOrEqual(query.from);
    } else if (query.to) {
      q['createdAt'] = LessThanOrEqual(query.to);
    }

    console.log("QQQQ", q);
    
    return this.service.findAllBase(q, { relations: this.RELATIONS.concat([
      'user.enrollments',
      'user.enrollments.batch',
      'user.enrollments.batchSection',
      'user.enrollments.batchSection.batch',
      'user.enrollments.course',
      'user.userRoles',
      'user.userRoles.role',
    ])});
  }

  @Post()
  async create(@Body() payload: CreateNotifierDTO): Promise<SuccessResponse | Notifier> {
    return this.service.createOne(payload);
  }

  @Post('send')
  async send(@Body() payload: SendNotifierDTO): Promise<SuccessResponse | Notifier[]> {
    const { users, user, ...rest } = payload;
    if (payload.users && payload.users.length > 0) {
      return Promise.all(payload.users.map(async (user) => {
        return this.service.createOne({
          ...rest,
          user: user,
        });
      })) as Promise<Notifier[]>;
    }
    return [];
  }

  @Patch('/seen')
  async updateNotifiersSeenStatus(
    @Body() payload: UpdateNotificationStatusDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse> {
    return this.service.updateNotifiersSeenStatus(payload, authUser);
  }
}
