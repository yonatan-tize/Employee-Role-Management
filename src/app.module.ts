import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleManagementModule } from './role-management/role-management.module';

@Module({
  imports: [RoleManagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
