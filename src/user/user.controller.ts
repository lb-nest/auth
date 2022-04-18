import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
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

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  findOne(@User() user: any) {
    return this.userService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me/projects')
  getProjects(@User() user: any) {
    return this.userService.getProjects(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('@me')
  update(@User() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user.me, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('@me')
  delete(@User() user: any) {
    return this.userService.delete(user.id);
  }
}
