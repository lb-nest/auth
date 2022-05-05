import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Project } from 'src/project/entities/project.entity';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(new TransformInterceptor(User))
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(User))
  @Get('@me')
  findMe(@Auth() user: Omit<TokenPayload, 'project'>) {
    return this.userService.findOne(user.id);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Project))
  @Get('@me/projects')
  getProjects(@Auth() user: Omit<TokenPayload, 'project'>) {
    return this.userService.getProjects(user.id);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(User))
  @Patch('@me')
  update(
    @Auth() user: Omit<TokenPayload, 'project'>,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(User))
  @Delete('@me')
  delete(@Auth() user: Omit<TokenPayload, 'project'>) {
    return this.userService.delete(user.id);
  }

  @Get('@me/confirm')
  @HttpCode(204)
  confirmEmail(@Query('code') code: string) {
    return this.userService.confirmEmail(code);
  }
}
