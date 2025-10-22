import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GlobalRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const request = context.switchToHttp().getRequest();
        if (typeof response === 'object' && response?.data && request?.verifiedUser) {
          if (request.method === 'POST') {
            response.data.createdBy = request.verifiedUser;
          } else if (request.method === 'PUT' || request.method === 'PATCH') {
            response.data.updatedBy = request.verifiedUser;
          } else if (request.method === 'DELETE') {
            response.data.deletedBy = request.verifiedUser;
          }
        }
        return response;
      }),
    );
  }
}
