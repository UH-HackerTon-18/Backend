import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity('tbl_world')
export class World {
  @PrimaryColumn()
  id: string;

  @Column()
  worldStory: string;

  @Column()
  species: string;

  @Column()
  speciesExplain: string;

  @Column()
  style: string;
}

@Entity('tbl_world_prompt_history')
export class WorldPromptHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  role: string;

  @Column({length: 5000})
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => World)
  world: World;
}