import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { IsEnum } from "class-validator";
import { Role } from "@prisma/client";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Auth } from "../common/decorators/auth.decorator";

class SetRoleDto {
  @IsEnum(Role) role!: Role;
}

@Controller("users")
@Auth(Role.ADMIN) // toda la gestión de usuarios es solo para ADMIN
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(":id/role")
  setRole(@Param("id") id: string, @Body() dto: SetRoleDto) {
    return this.users.setRole(id, dto.role);
  }

  // Reenvía/restablece la contraseña temporal de un usuario interno.
  @Post(":id/reset-password")
  resetPassword(@Param("id") id: string) {
    return this.users.resetPassword(id);
  }
}
