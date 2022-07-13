import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception);
  }
}
