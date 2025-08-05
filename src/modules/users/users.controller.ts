import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //@ApiBearerAuth()
  @Get()
  //@Roles(Role.Admin)
  //@UseGuards(AuthGuard, RolesGuard)
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('role', new ParseEnumPipe(UserRole, { optional: true }))
    role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.usersService.getUsers(page, limit, role, search);
  }

  //@ApiBearerAuth()
  @Get(':id')
  //@Roles(Role.Admin)
  //@UseGuards(AuthGuard, RolesGuard)
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUser(id);
  }

  //@ApiBearerAuth()
  @Put(':id')
  //@Roles(Role.Admin)
  //@UseGuards(AuthGuard, RolesGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, data);
  }

  //@ApiBearerAuth()
  @Delete(':id')
  //@Roles(UserRole.ADMIN)
  //@UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  //@ApiBearerAuth()
  @Put(':id/restore')
  //@Roles(UserRole.ADMIN)
  //@UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  restoreUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }
}
