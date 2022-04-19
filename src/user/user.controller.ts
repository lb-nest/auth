import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/auth/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Get('@me')
  findOne(@User() user: any) {
    return this.userService.findOne(user.id);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Get('@me/projects')
  getProjects(@User() user: any) {
    return this.userService.getProjects(user.id);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Patch('@me')
  update(@User() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user.id, updateUserDto);
  }

  @SetMetadata('allowUserToken', true)
  @UseGuards(JwtAuthGuard)
  @Delete('@me')
  delete(@User() user: any) {
    return this.userService.delete(user.id);
  }

  @Get('@me/confirm')
  confirmEmail(@Query('code') code: string) {
    return this.userService.confirmEmail(code);
  }
}
