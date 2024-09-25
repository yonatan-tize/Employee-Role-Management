import { Test, TestingModule } from '@nestjs/testing';
import { RoleManagementController } from './role-management.controller';
import { RoleManagementService } from './role-management.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleManagement } from './entities/role-management.entity';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';

describe('RoleManagementController', () => {
  let controller: RoleManagementController;
  let service: RoleManagementService;
  let repositoryMock: Partial<Record<keyof Repository<RoleManagement>, jest.Mock>>;

  beforeEach(async () => {
    repositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleManagementController],
      providers: [
        {
          provide: RoleManagementService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findChildren: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleManagement), // Mock the repository
          useValue: repositoryMock,
        },
      ],
    }).compile();

    controller = module.get<RoleManagementController>(RoleManagementController);
    service = module.get<RoleManagementService>(RoleManagementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the correct DTO', async () => {
      const dto: CreateRoleManagementDto = {
        name: 'CEO', 
        description: 'CEO',
        parentId: null
      };
      const result = { id: 1, name: 'CEO', parentId: null, description: 'CEO' };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(response.description).toEqual(result.description);
      expect(response.name).toEqual(result.name);
      expect(response.parentId).toEqual(result.parentId);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return all roles', async () => {
      const roles = [
        { id: 1, name: 'CEO', parentId: null, description: 'CEO' }, 
        { id: 2, name: 'COO', parentId: 1, description: 'COO' }
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(roles);

      const response = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(response.length).toEqual(roles.length);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the correct id', async () => {
      const id = '1';
      const role = { id: 1, name: 'CEO', parentId: null, description: "CEO" };
      jest.spyOn(service, 'findOne').mockResolvedValue(role);

      const response = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
      expect(response).toEqual(role);
    });
  });

  describe('findChildren', () => {
    it('should call service.findChildren with the correct id', async () => {
      const id = '1';
      const children = [
        { id: 2, name: 'coo', parentId: 1, description: 'COO' },
        { id: 2, name: 'cto', parentId: 1, description: 'CTO' }
      ];
      jest.spyOn(service, 'findChildren').mockResolvedValue(children);

      const response = await controller.findChildren(id);
      expect(service.findChildren).toHaveBeenCalledWith(+id);
      expect(response).toEqual(children);
    });
  });

  describe('update', () => {
    it('should call service.update with the correct id and DTO', async () => {
      const id = '1';
      const dto: UpdateRoleManagementDto = { name: 'Updated Role', parentId: 1 };
      const updatedRole = { generatedMaps: [], raw: [], affected: 1 };
      jest.spyOn(service, 'update').mockResolvedValue(updatedRole);

      const response = await controller.update(id, dto);
      expect(service.update).toHaveBeenCalledWith(+id, dto);
      expect(response).toEqual(updatedRole);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      const id = '1';
      const result = { affected: 1, raw: {} };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      const response = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
      expect(response).toEqual(result);
    });
  });
});