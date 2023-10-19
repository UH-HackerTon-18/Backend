import {Module} from '@nestjs/common';
import {TypeormConfigModule} from "./global/config/typeorm.config";
import {ConfigModule} from "@nestjs/config";
import {CharacterModule} from "./global/module/character.module";

@Module({
  imports: [
    TypeormConfigModule,
    CharacterModule,
    ConfigModule.forRoot({isGlobal: true})
  ],
})
export class AppModule {
}
