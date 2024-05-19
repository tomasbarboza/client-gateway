import { Controller, Get, Post, Body, Param, Inject, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { catchError, firstValueFrom } from 'rxjs';
import PaginationDto from 'src/common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('create-order', createOrderDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    
    );
  }

  @Get()
  findAll( @Query() orderPaginationDto: OrderPaginationDto ) {
    return this.client.send('find-all-orders', orderPaginationDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  
  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe ) id: string) {
    try {
      const order = await firstValueFrom(
        this.client.send('find-one-order', { id })
      );

      return order;

    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    try {

      const order = await firstValueFrom(this.client.send('find-all-orders', {
        ...paginationDto,
        status: statusDto.status,
      }));

      return order;

    } catch (error) {
      throw new RpcException(error);
    }
  }


  @Patch(':id')
  async changeStatus(
    @Param('id', ParseUUIDPipe ) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      const order =await firstValueFrom(
      this.client.send('change-order-status', { id, status: statusDto.status })
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

}