import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        BROKER_URL: Joi.string().uri().required(),
        DATABASE_URL: Joi.string().uri().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        SECRET: Joi.string().required(),
        MAILER_TRANSPORT: Joi.string().required(),
      }),
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const transport = configService.get<string>('MAILER_TRANSPORT');
        return {
          transport,
          defaults: {
            from: `lb-nest <${decodeURIComponent(
              new URL(transport).username,
            )}>`,
          },
          template: {
            adapter: new HandlebarsAdapter(),
            dir: __dirname,
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProjectModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
