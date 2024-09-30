import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    // create a new role
    async create(createRoleManagementDto: CreateRoleManagementDto) {

      // Check if parent role exists (except for CEO which has no parent)
      if (createRoleManagementDto.parentId !== null) {
        const parentRole = await this.roleManagementRepository.findOne({
          where: { id: createRoleManagementDto.parentId }
        });
        if (!parentRole) throw new NotFoundException({ message: "Parent Role Not Found" });
        
      }

      const newRole = this.roleManagementRepository.create(createRoleManagementDto);
      return await this.roleManagementRepository.insert(newRole); 
    }

    async findAll(){
      const roles = await this.roleManagementRepository.find()
      return roles
    }
    
    // Return the current role with its nested children as an object.
    async findRoleTree(id: string){

      // Recursively find the child roles and structure them as a tree.
      const buildHierarchy = async (id: string) => {
        const childRoles = await this.roleManagementRepository.find({ where: {parentId: id} })
        if (!childRoles) return {}

        const children = {} 
        for (const child of childRoles) {
          const grandChildRoles = await buildHierarchy(child.id);  // Recursively find children
          children[child.name] = grandChildRoles;  // Use child.name as the key 
        }

        return children
      };

      const role = await this.roleManagementRepository.findOne({ where: { id } });
      if (!role) throw new NotFoundException({message: "Role Not Found"});
      const descendant = await buildHierarchy(id)

      return{ [role.name]: descendant}
    }


    // find role by id
    async findOne(id: string) {
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if (!role) throw new NotFoundException({message: "Role Not Found"});
        return role;
    }


    // Get all childrens of a specific position/role
    async findChildren(id: string){
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if(!role) throw new NotFoundException({message: "Role Not Found"});

        // get children of given role
        const children = await this.roleManagementRepository.find({ where: { parentId: id } }); 
        return children
    }
      
    
    // Updates a role for the given id.
    async update(id: string, updateRoleManagementDto: UpdateRoleManagementDto) {
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

        await this.roleManagementRepository.update(id, updateRoleManagementDto);
        return await this.roleManagementRepository.findOne({ where: { id } });
    }


    // find the role by id and if exist delete the role
    async remove(id: string) {
        //check if role already exists
        const role = await this.roleManagementRepository.findOne({ where: { id } });
        if (!role) throw new NotFoundException({message: "Role Not Found"});

        // If the role has children, update their parentId to the parentId of the role being deleted
        await this.roleManagementRepository.update( { parentId: id },  { parentId: role.parentId } )
        return await this.roleManagementRepository.delete(id);
    }
}
