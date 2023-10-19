import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {CharacterService} from '../service/character.service';
import {ChatCharacterRequest, CreateWorldRequest} from "./dto/character.dto";

@Controller('characters')
export class CharacterController {
  constructor(private readonly appService: CharacterService) {
  }

  @Post()
  async createWorld(@Body() request: CreateWorldRequest) {
    return await this.appService.createWorld(request);
  }

  @Get('/world/:worldId')
  async getCharacters(@Param('worldId') worldId: string) {
    return await this.appService.getCharacters(worldId);
  }

  @Get('/:characterId')
  async getCharacterDetail(@Param('characterId') characterId: string) {
    return await this.appService.queryCharacterDetail(characterId);
  }

  @Post('/chat/:characterId')
  async answerCharacter(@Param('characterId') characterId: string, @Body() request: ChatCharacterRequest) {
    return await this.appService.answerCharacter(characterId, request.prompt);
  }
}
