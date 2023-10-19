export class CreateWorldRequest {
  character_count: number;
  world_story: string;
  main_character?: MainCharacter;
}

export class ChatCharacterRequest {
  prompt: string;
}

export class MainCharacter {
  name: string;
  gender: string;
  age: string;
  species: string;
  species_explain: string;
  style: string;
  character: string;
  background_story: string;
}

export class QueryCharactersResponse {
  characters: CharacterResponse[];
}

export class CharacterResponse {

  constructor(id: string, name: string, profile_image_url: string) {
    this.id = id;
    this.name = name;
    this.profile_image_url = profile_image_url;
  }

  id: string;
  name: string;
  profile_image_url: string;
}

export class QueryCharacterDetailResponse {
  id: string;
  name: string;
  gender: string;
  age: string;
  profile_image_url: string;
  background_story: string;
  job: string;
  character: string;
  relation: RelationResponse[]
}

export class RelationResponse {

  constructor(id: string, name: string, explain: string, profile_image_url: string) {
    this.id = id;
    this.profile_image_url = profile_image_url;
    this.name = name;
    this.explain = explain;
  }

  id: string;
  name: string;
  profile_image_url: string;
  explain: string;
}