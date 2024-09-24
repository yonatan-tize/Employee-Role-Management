import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';

@Controller('role-management')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  @Post()
  create(@Body() createRoleManagementDto: CreateRoleManagementDto) {
    return this.roleManagementService.create(createRoleManagementDto);
  }

  @Get()
  findAll() {
    return this.roleManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleManagementDto: UpdateRoleManagementDto) {
    return this.roleManagementService.update(+id, updateRoleManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleManagementService.remove(+id);
  }
}
