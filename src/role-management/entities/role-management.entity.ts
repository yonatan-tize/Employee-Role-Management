import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "role_managements"})
export class RoleManagement {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({type: "text", unique: true})
    name: string;

    @Column({type: "text"})
    description: string;

    @Column({type: 'uuid', nullable: true})
    parentId: number | null;
}
