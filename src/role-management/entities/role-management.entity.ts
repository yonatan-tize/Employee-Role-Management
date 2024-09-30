import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "role_managements"})
export class RoleManagement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: "text", unique: true})
    name: string;

    @Column({type: "text"})
    description: string;

    @Column({type: 'uuid', nullable: true})
    parentId: string | null;
}
