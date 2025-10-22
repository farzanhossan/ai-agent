import { ICommand } from '@nestjs/cqrs';
import { CreateNotifierDTO } from '@src/app/modules/notifier/dtos';

export class NotifierCreatedCommand implements ICommand {
  payload: {
    data: CreateNotifierDTO;
    roleBased?: boolean;
    roles?: string[];
  };

  constructor(payload: { data: CreateNotifierDTO; roleBased?: boolean; roles?: string[] }) {
    this.payload = {
      ...payload,
      roleBased: payload.roleBased ?? false,
      roles: payload.roles ?? [],
    };
  }
}
