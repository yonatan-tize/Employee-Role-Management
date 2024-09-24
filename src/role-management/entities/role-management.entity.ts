import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "role-management"})
export class RoleManagement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text"})
    name: string;

    @Column({type: "text"})
    description: string;

    @Column({type: "int", nullable: true})
    parentId: number | null;
}
