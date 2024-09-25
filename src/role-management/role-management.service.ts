import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';
import { Repository } from 'typeorm';
import { RoleManagement } from './entities/role-management.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleManagementService {

  constructor(
    @InjectRepository(RoleManagement)
    private readonly roleManagementRepository: Repository<RoleManagement>){}

    async create(createRoleManagementDto: CreateRoleManagementDto) {
  
      // Check if parent role exists (except for CEO which has no parent)
      if (createRoleManagementDto.parentId !== null) {
        const parentRole = await this.roleManagementRepository.findOne({
          where: { id: createRoleManagementDto.parentId }
        });
        if (!parentRole) {
          throw new NotFoundException({ message: "Parent Role Not Found" });
        }
      }
    
      // Check if the role already exists
      const existingRole = await this.roleManagementRepository.findOne({
        where: { name: createRoleManagementDto.name }
      });
      if (existingRole) {
        throw new ConflictException({ message: "Role Already Exists" });
      }
    
      // Check if the CEO role is trying to have a parent
      if (createRoleManagementDto.name === "CEO" && createRoleManagementDto.parentId !== null) {
        throw new BadRequestException({ message: "CEO Cannot Have A Parent" });
      }
    
      // Create and save the new role
      const newRole = this.roleManagementRepository.create(createRoleManagementDto);
      return await this.roleManagementRepository.save(newRole);
    }
    

  async findAll() {
    return await this.roleManagementRepository.find()
  }


  // find role by id
  async findOne(id: number) {
    const role = await this.roleManagementRepository.findOne({
      where: { id}
    });

    if (!role) throw new NotFoundException({message: "role not found"});

    return role;
  }

  
  //Updates a role for the given id.
  async update(id: number, updateRoleManagementDto: UpdateRoleManagementDto) {
    const role = await this.roleManagementRepository.findOne({
      where: { id}
    });
    if (!role) throw new NotFoundException({message: "Role Not Found"});

    // check if the parent role does not exist
    if (updateRoleManagementDto.parentId){
      const parentRole = await this.roleManagementRepository.find({
        where: { parentId : updateRoleManagementDto.parentId }
      })
      if (!parentRole) throw new NotFoundException({message: "Parent Not Found"})
    }

    return await this.roleManagementRepository.update(id, updateRoleManagementDto);
  }


  // find the role by id and if exist delete the role
  async remove(id: number) {
    const role = await this.roleManagementRepository.findOne({
      where: { id}
    });
    if (!role) throw new NotFoundException({message: "Role Not Found"});

    return await this.roleManagementRepository.delete(id);
  }
}
