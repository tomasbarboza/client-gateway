import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common'

export const AccessToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest()
    
    if(!request.accessToken) {
        throw new InternalServerErrorException('Token not found in request')
        }
    return request.accessToken
 
})