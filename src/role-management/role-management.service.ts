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
      try{
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
      } catch(err){
          throw new InternalServerErrorException(
            {
              message: "Failed to Create Role",
              error: err.message
            }
          )
      }
    }
    

    //find all roles
    async findAll() {
      try{
        return await this.roleManagementRepository.find()
      } catch(err){
        throw new InternalServerErrorException(
          {
            message: "Failed to Get Roles",
            error: err.message
          }
        )
      }
    }


    // find role by id
    async findOne(id: number) {
      try{
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({
          where: { id }
        });

        if (!role) throw new NotFoundException({message: "Role Not Found"});

        return role;
      }catch(err){
        throw new InternalServerErrorException(
          {
            message: "Failed to Get Role",
            error: err.message
          }
        )
      }
    }


    // Get all childrens of a specific position/role
    async findChildren(id: number){
      try{
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if(!role) throw new NotFoundException({message: "Role Not Found"});

        // check if role has children
        const children = await this.roleManagementRepository.find({
          where: { parentId: id }
        }); 
        if (!children) throw new NotFoundException({message: `No Child For ${role.name} `}) 

        return children
      } catch(err){
          throw new InternalServerErrorException(
            {
              message: "Failed to Get Children",
              error: err.message
            }
          )
      }
    }
      
    
    // Updates a role for the given id.
    async update(id: number, updateRoleManagementDto: UpdateRoleManagementDto) {
      try{
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({
          where: { id }
        });
        if (!role) throw new NotFoundException({message: "Role Not Found"});

        //check if the role is CEO and is trying to get parent
        if (role.name === "CEO" && updateRoleManagementDto.parentId !== null ){
          throw new BadRequestException({message: "CEO Cannot Have A Parent"})
        }

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
