import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';
import { Repository } from 'typeorm';
import { RoleManagement } from './entities/role-management.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { error } from 'node:console';

@Injectable()
export class RoleManagementService {

  constructor(
    @InjectRepository(RoleManagement)
    private readonly roleManagementRepository: Repository<RoleManagement>){}

    // create a new role
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
    
      // Check if the CEO role is trying to have a parent
      if (createRoleManagementDto.name === "CEO" && createRoleManagementDto.parentId !== null) {
        throw new BadRequestException({ message: "CEO Cannot Have A Parent" });
      }

      try {
        // Create and insert the new role
        const newRole = this.roleManagementRepository.create(createRoleManagementDto);
        return await this.roleManagementRepository.insert(newRole); 

      } catch(err){
          throw new InternalServerErrorException( // handle exception globally
            {
              message: "Failed to Create Role",
              error: err.message
            }
          )
      }
    }
    

    //find all roles
    // async findAll() {
    //   try{
    //     return await this.roleManagementRepository.find()
    //   } catch(err){
    //     throw new InternalServerErrorException(
    //       {
    //         message: "Failed to Get Roles",
    //         error: err.message
    //       }
    //     )
    //   }
    // }


    //find all roles
    async findRoleInTree(id: number){
      const childRoles = await this.roleManagementRepository.find({ where: {parentId: id} })
      if (!childRoles) return {}

      const children = {} 
      for (const child of childRoles) {
        const grandChildRoles = await this.findRoleInTree(child.id);  // Recursively find children
        if (grandChildRoles) {
          children[child.name] = grandChildRoles;  // Use child.name as the key
        }
      }

      const currRoleName = (await this.roleManagementRepository.findOne({ where: { id } }));
      return { [currRoleName.name] : children }
    }


    // find role by id
    async findOne(id: number) {
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if (!role) throw new NotFoundException({message: "Role Not Found"});

        return role;
    }


    // Get all childrens of a specific position/role
    async findChildren(id: number){
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if(!role) throw new NotFoundException({message: "Role Not Found"});

        // get children of given role
        const children = await this.roleManagementRepository.find({
          where: { parentId: id }
        }); 

        return children
    }
      
    
    // Updates a role for the given id.
    async update(id: number, updateRoleManagementDto: UpdateRoleManagementDto) {
      try{
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({
          where: { id }
        });
        if (!role) throw new NotFoundException({message: "Role Not Found"});

        // check self reference
        if (updateRoleManagementDto.parentId === role.id){
          throw new BadRequestException({message: 'Can not Reference Self As Parent'})
        }

        // check if the parent role already exists
        if (updateRoleManagementDto.parentId){
          const parentRole = await this.roleManagementRepository.find({
            where: { parentId : updateRoleManagementDto.parentId }
          })
          if (!parentRole) throw new NotFoundException({message: "Parent Not Found"})
        }

        return await this.roleManagementRepository.update(id, updateRoleManagementDto);

      } catch(err){
          throw new InternalServerErrorException(
            {
              message: "Failed to Update Role",
              error: err.message
            }
          )
      }
    }


    // find the role by id and if exist delete the role
    async remove(id: number) {
      try{
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({
          where: { id }
        });
        if (!role) throw new NotFoundException({message: "Role Not Found"});

        // If the role has children, update their parentId to the parentId of the role being deleted
        await this.roleManagementRepository.update(
          {parentId: id},  
          {parentId: role.parentId}
        )

        //delete the row
        return await this.roleManagementRepository.delete(id);

      } catch(err){
          throw new InternalServerErrorException({
            message: 'Failed to Remove Role',
            error: err.message
          });
      }
    }
}
