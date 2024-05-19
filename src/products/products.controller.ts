import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { catchError } from "rxjs";
import PaginationDto from "src/common/dto/pagination.dto";
import { NATS_SERVICE } from "src/config";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  createProduct(@Body() body: CreateProductDto) {
    return this.client.send({ cmd: "create-product" }, body).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.client
      .send({ cmd: "find-all-products" }, paginationDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get(":id")
  findProduct(@Param("id") id: string) {
    return this.client.send({ cmd: "find-one-product" }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(":id")
  updateProduct(@Param("id") id: string, @Body() body: UpdateProductDto) {
    return this.client
      .send({ cmd: "update-product" }, { id, ...body })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Delete(":id")
  deleteProduct(@Param("id") id: string) {
    return this.client.send({ cmd: "remove-product" }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
