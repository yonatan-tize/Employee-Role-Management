import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';

@Controller('role')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  //post a new role
  @Post()
  create(@Body(ValidationPipe) createRoleManagementDto: CreateRoleManagementDto) {
    return this.roleManagementService.create(createRoleManagementDto);
  }

  // get all roles
  @Get(':id/children/tree')
  findAll(@Param('id') id: string) {
    return this.roleManagementService.findAll(id);
  }


  // get a single role by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleManagementService.findOne(id);
  }

  // get children of a role given the id
  @Get(':id/children')
  findChildren(@Param('id') id: string){
    return this.roleManagementService.findChildren(id)
  }

  //update a role for the provided id
  @Patch(':id') 
  update(@Param('id') id: string, @Body(ValidationPipe) updateRoleManagementDto: UpdateRoleManagementDto) {
    return this.roleManagementService.update(id, updateRoleManagementDto);
  }

  // delete a role given the id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleManagementService.remove(id);
  }
}
