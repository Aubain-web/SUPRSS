"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const collection_module_1 = require("./collections/collection.module");
const arcticle_module_1 = require("./articles/arcticle.module");
const feeds_module_1 = require("./feeds/feeds.module");
const rss_module_1 = require("./rss/rss.module");
const user_module_1 = require("./user/user.module");
const comment_module_1 = require("./comment/comment.module");
const message_module_1 = require("./message/message.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            user_module_1.UsersModule,
            feeds_module_1.FeedsModule,
            arcticle_module_1.ArticlesModule,
            collection_module_1.CollectionsModule,
            comment_module_1.CommentsModule,
            message_module_1.MessagesModule,
            rss_module_1.RssModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map