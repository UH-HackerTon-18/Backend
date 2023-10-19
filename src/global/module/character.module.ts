import {Module} from "@nestjs/common";
import {CharacterService} from "../../domain/character/service/character.service";
import {CharacterController} from "../../domain/character/presentation/character.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Character} from "../../domain/character/entity/character.entity";
import {World, WorldPromptHistory} from "../../domain/character/entity/world.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, World, WorldPromptHistory]),
  ],
  controllers: [CharacterController],
  providers: [CharacterService]
})
export class CharacterModule {
}