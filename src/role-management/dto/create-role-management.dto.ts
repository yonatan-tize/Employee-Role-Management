import { IsInt, isNumber, IsNumberString, IsOptional, IsString } from "class-validator"

export class CreateRoleManagementDto {
    @IsString()
    name: string

    @IsString()
    description: string

    @IsOptional()
    @IsInt()
    parentId: number | null
}
