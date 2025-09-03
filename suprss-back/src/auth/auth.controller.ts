import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.register.dto';
import { LoginDto } from './dto/auth.login.dto';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from './Jwt.auth.guard';
import { CurrentUser } from '../common/current-user';
import { RequestWithUser } from '../common/express-request-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  // OAuth Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(req.user, 'google');
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`);
  }

  // OAuth GitHub
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(req.user, 'github');
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`);
  }
}
