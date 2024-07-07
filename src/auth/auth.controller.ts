import { Controller, Post, Body, Inject, UseGuards } from "@nestjs/common";
import { LoginUserDto, CreateUserDto } from "./dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { NATS_SERVICE } from "src/config";
import { EmptyError, firstValueFrom } from "rxjs";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./interfaces/current-user.interface";
import { AccessToken, User } from "./decorators";

@Controller("auth")
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const data = await firstValueFrom(
        this.client.send("auth.login.user", loginUserDto),
      );
      return data;
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new RpcException("No response received from auth service.");
      }
      throw new RpcException(error);
    }
  }

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const data = await firstValueFrom(
        this.client.send("auth.register.user", createUserDto),
      );
      return data;
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new RpcException("No response received from auth service.");
      }
      throw new RpcException(error);
    }
  }

  @Post("verify-user")
  @UseGuards(AuthGuard)
  async verifyUser( 
    @User() user: CurrentUser,
    @AccessToken() accessToken: string
  ) {

    // return this.client.send("auth.verify.user", {}).pipe(
    //   catchError((error) => {
    //     throw new RpcException(error);
    //   }),
    // );

    return {
      user,
      accessToken,
    };
  }
}
