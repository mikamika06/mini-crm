import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";
import { Res } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return { message: "registered" };
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token } = await this.authService.login(dto);

    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie("token", access_token, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax', 
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
      domain: isProduction ? undefined : undefined, 
    });

    return { message: "Logged in", access_token }; 
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token", {
      path: "/",
    });

    return { message: "Logged out" };
  }

  @Post("test-db")
  async testDb() {
    try {
      await this.authService.testDbConnection();
      return { message: "Database connection successful" };
    } catch (error: any) {
      return { message: "Database connection failed", error: error.message };
    }
  }
}
