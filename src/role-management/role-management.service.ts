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

    //check if parent exist
    const role = await this.roleManagementRepository.find({
      where: {
        parentId : createRoleManagementDto.parentId
      }
    })
    if (!role){
      throw new NotFoundException({message: "Parent Role Not Found"})
    }

    // check if the role aleady exist
    const requestRole = await this.roleManagementRepository.find({
      where: {
        name: createRoleManagementDto.name
      }
    })
    if (requestRole) throw new ConflictException({message: "Role Alreay Exists"})

    // check if the parent of CEO is null
    if (createRoleManagementDto.name === "CEO" && createRoleManagementDto.parentId != null){
      throw new BadRequestException({message: "CEO Can Not Have A Parent"})
    }

    const newRole = this.roleManagementRepository.create(createRoleManagementDto) 


    return await this.roleManagementRepository.save(newRole)
  }

  async findAll() {
    return await this.roleManagementRepository.find()
  }

  async findOne(id: number) {
    const role = await this.roleManagementRepository.findOne({
      where: { id}
    });

    if (!role) throw new NotFoundException({message: "role not found"});

    return role;
  }

  async update(id: number, updateRoleManagementDto: UpdateRoleManagementDto) {
    const role = await this.roleManagementRepository.findOne({
      where: { id}
    });
    if (!role) throw new NotFoundException({message: "Role Not Found"});

    if (updateRoleManagementDto.parentId){
      const parentRole = await this.roleManagementRepository.find({
        where: {
          parentId : updateRoleManagementDto.parentId
        }
      })

    }

    return `This action updates a #${id} roleManagement`;
  }

  async remove(id: number) {
    return `This action removes a #${id} roleManagement`;
  }
}
