import { IsInt, isNumber, IsNumberString, IsString } from "class-validator"

export class CreateRoleManagementDto {
    @IsString()
    name: string

    @IsString()
    description: string

    @IsInt()
    parentId: number
}
