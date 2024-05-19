import { Catch, RpcExceptionFilter, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {

    const logger = new Logger('RpcCustomExceptionFilter');

    const context = host.switchToHttp();
    
    const response = context.getResponse();

    const rpcError = exception.getError();

    if (rpcError.toString().includes('Empty response')) {
      logger.error('Empty response from microservice');
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: rpcError.toString().substring(0, rpcError.toString().indexOf('(') - 1)
      });
    }

    if ( 
      typeof rpcError === 'object' && 
      'status' in rpcError && 
      'message' in rpcError) 
    {
      const { status } = rpcError;

      const statusCode = isNaN(+status) ? HttpStatus.BAD_REQUEST :+status;

      return response.status(statusCode).json(rpcError);
    }

    return response.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: rpcError,
    });
  }
}