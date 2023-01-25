import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './stratigies/jwt.strategy';

@Module({
  imports: [forwardRef(() => AppModule), PassportModule],
  providers: [PrismaService, AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
