import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {World} from "./world.entity";

@Entity('tbl_character')
export class Character {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  job: string;

  @Column()
  gender: string;

  @Column()
  age: string;

  @Column({nullable: true})
  species?: string;

  @Column({nullable: true})
  speciesExplain?: string;

  @Column()
  character: string;

  @Column()
  profileImageUrl: string;

  @Column()
  backgroundStory: string;

  @Column()
  relationInfo: string;

  @ManyToOne(() => World)
  world: World;
}