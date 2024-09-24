import { Module } from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { RoleManagementController } from './role-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleManagement } from './entities/role-management.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleManagement])],
  controllers: [RoleManagementController],
  providers: [RoleManagementService],
})
export class RoleManagementModule {}
