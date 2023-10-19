import {Injectable, NotFoundException} from '@nestjs/common';
import {
  CharacterResponse,
  CreateWorldRequest,
  QueryCharacterDetailResponse,
  QueryCharactersResponse,
  RelationResponse
} from "../presentation/dto/character.dto";
import axios, {AxiosResponse} from "axios";
import {InjectRepository} from "@nestjs/typeorm";
import {Character} from "../entity/character.entity";
import {Repository} from "typeorm";
import {World, WorldPromptHistory} from "../entity/world.entity";

@Injectable()
export class CharacterService {

  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(World)
    private readonly worldRepository: Repository<World>,
    @InjectRepository(WorldPromptHistory)
    private readonly worldPromptHistoryRepository: Repository<WorldPromptHistory>
  ) {
  }

  async createWorld(request: CreateWorldRequest): Promise<any> {
    console.log("success");
    let character = "해당 세계의 주인공 캐릭터를 생성,";
    if (request.main_character != null) {
      character = `주인공의 정보는 다음과 같다, 이름: ${request.main_character.name}, 성별: ${request.main_character.gender}, 나이: ${request.main_character.age}, 성격: ${request.main_character.character} 성격, 배경스토리: ${request.main_character.background_story}`
    }
    const prompt = {
      role: "user",
      content: `${request.world_story}를/을 배경으로하는 임의의 세계 생성 해당 세계는 고유한 32자의 uuid형식의 식별자를 가짐 해당 식별자는 추후 새로 생기게될 다른 세계와 구분하기 위해 사용,\n` +
        `${character}\n` +
        `또한 해당 주인공을 중심으로 연관된 캐릭터를 ${request.character_count}명 생성,\n` +
        "해당 캐릭터들은 각각 주인공 또는 생성된 다른 캐릭터들과 연관이 있음,\n" +
        "각 캐릭터들은 식별자로 랜덤한 32자의 uuid형식의 키를 가짐,\n" +
        "먼저 첫줄에 생성된 임의의 세계 식별자를 WorldId:(생성된 세계식별자)형식으로 출력,\n" +
        "이후 생성된 캐릭터들을 다음의 형식으로 출력하라,\n" +
        "%%%id(해당 캐릭터의 식별자)|이름(캐릭터 이름)|성별(캐릭터 성별)|나이(캐릭터 나이)|직업(캐릭터 직업)|자세한 캐릭터의 외모묘사(캐릭터 외모 영어로%캐릭터 외모 한국어로)|주변인과의 관계([주변인물id, 주변인물 이름, 관계], [주변인물id, 주변인물 이름, 관계])|배경스토리(해당 인물의 배경스토리)}|캐릭터성격%%%,\n" +
        "캐릭터정보 예시: %%%9i8j7k6l5m4n3o2p|Ella|여성|30|간호사|Middling height with long blonde hair and green eyes. She has a gentle appearance.%중간 키에 긴 금발과 초록색 눈을 가진 그녀는 부드러운 외모를 가지고 있다.|[3f12ecb0-f35b-4262-83df-9835d56e5a8a, Jack, 가족], [8a83f925-2b8f-467a-8907-8358e0fb0d7e, Sarah, 친구]|Ella는 간호사로서 생존자들을 돕기 위해 의료 지원을 제공한다.|밝고 활발한 성격%%%\n" +
        "결과값만 출력, 오직 프롬프트에 제시된 내용만 출력"
    }
    let response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4",
      messages: [prompt]
    }, {
      headers: {
        Authorization: 'Bearer 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'
      }
    });
    const resPrompt = response.data.choices[0].message;
    const split = resPrompt.content.replaceAll("\n", "").split('%%%');
    const worldId = split[0];
    const savedWorld = await this.worldRepository.save({
      id: worldId.substring(8).replaceAll(' ', ''),
      worldStory: request.world_story,
      species: request.main_character?.species ?? '인간',
      speciesExplain: request.main_character?.species_explain ?? '지능이 높다.',
      style: request.main_character?.style ?? ' ',
    });
    await this.worldPromptHistoryRepository.save({
      role: prompt.role,
      content: prompt.content,
      world: savedWorld
    });
    await this.worldPromptHistoryRepository.save({
      role: resPrompt.role,
      content: resPrompt.content,
      world: savedWorld
    });
    split.shift();
    for (const i of split) {
      if (i == '' || i == ' ') {
        continue;
      }
      const buf = i.split('|');
      console.log(buf);
      const char = buf[5].split('%')[0];
      let gender: string;
      if (buf[2] == '남성') {
        gender = 'man'
      } else {
        gender = 'woman'
      }
      const response = await axios.post('https://api.kakaobrain.com/v2/inference/karlo/t2i', {
        prompt: `front view, center composition,hyper-detailed front ${char}, highly detailed face, digital art, impressionism, deep gaze,artgeem, photorealistic anime ${gender} render, ${savedWorld.style}`,
        prior_num_inference_steps: 80,
        prior_guidance_scale: 10.0
      }, {
        headers: {
          Authorization: 'KakaoAK 275e7dddb9f39976351325f47f8f018d'
        }
      });
      await this.characterRepository.save({
        id: buf[0],
        name: buf[1],
        gender: buf[2],
        job: buf[4],
        age: buf[3],
        backgroundStory: buf[7],
        character: buf[8],
        profileImageUrl: response.data.images[0].image,
        relationInfo: buf[6],
        world: savedWorld
      });
    }

    return {
      world_id: savedWorld.id
    };
  }

  async getCharacters(worldId: string): Promise<QueryCharactersResponse> {
    const world = await this.worldRepository.findOneBy({id: worldId});
    if (!world) {
      throw new NotFoundException('world not found');
    }

    const characters = await this.characterRepository.findBy({world});
    const response: CharacterResponse[] = await Promise.all(characters.map(async character => await this.createCharacterResponse(character)));

    return {
      characters: response
    }
  }

  async queryCharacterDetail(characterId: string): Promise<QueryCharacterDetailResponse> {
    const character = await this.characterRepository.findOneBy({id: characterId});
    if (!character) {
      throw new NotFoundException('Character Not Found');
    }

    return await this.createCharacterResponse(character);
  }

  private async createCharacterResponse(character: Character): Promise<QueryCharacterDetailResponse> {
    const parsed = this.parseString(character.relationInfo);
    const relationResponse: RelationResponse[] = await Promise.all(parsed.map(
      async (relation) => {
        const character = await this.characterRepository.findOneBy({id: relation[0]});
        return new RelationResponse(relation[0], relation[1], relation[2], character.profileImageUrl);
      }
    ));

    return {
      id: character.id,
      name: character.name,
      gender: character.gender,
      age: character.age,
      job: character.job,
      character: character.character,
      background_story: character.backgroundStory,
      profile_image_url: character.profileImageUrl,
      relation: relationResponse
    };
  }


  parseString(str: string): Array<[string, string, string]> {
    const regex = /\[([^\]]+)\]/g;
    let match;
    const result = [];

    while ((match = regex.exec(str)) !== null) {
      const [id, name, relationship] = match[1].split(',').map(s => s.trim());
      result.push([id, name, relationship]);
    }

    return result;
  }

  async answerCharacter(characterId: string, prompt: string): Promise<any> {
    console.log(prompt);
    const character = await this.characterRepository.findOne({
      where: {
        id: characterId
      },
      relations: {
        world: true
      }
    });
    const promptHistories = await this.worldPromptHistoryRepository.find({
      where: {
        world: character.world
      },
      order: {
        createdAt: "ASC"
      }
    });
    const request = promptHistories.map(prompt => {
      return {
        role: prompt.role,
        content: prompt.content
      };
    });
    const newRequest = {
      role: "user",
      content: `캐릭터 ${character.id}에게 "${prompt}"라고 질문했을 때 해당 인물의 대답 출력.`
    }
    request.push(newRequest);
    await this.worldPromptHistoryRepository.save({
      role: newRequest.role,
      content: newRequest.content,
      world: character.world
    });

    let response: AxiosResponse<any, any>;
    try {
      response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: request,
      }, {
        headers: {
          Authorization: 'Bearer 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'
        }
      });
    } catch (e) {
      console.log(e.response.data);
    }
    await this.worldPromptHistoryRepository.save({
      role: response.data.choices[0].message.role,
      content: response.data.choices[0].message.content,
      world: character.world
    });

    return {
      response: response.data.choices[0].message.content
    };
  }
}
