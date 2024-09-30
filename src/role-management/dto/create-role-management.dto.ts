import { IsInt, IsOptional, IsString } from "class-validator"

export class CreateRoleManagementDto {
    @IsString()
    name: string

    @IsString()
    description: string

    @IsOptional()
    @IsString()
    parentId: string | null
}
