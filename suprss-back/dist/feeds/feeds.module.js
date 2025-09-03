"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const feeds_service_1 = require("./feeds.service");
const feeds_controller_1 = require("./feeds.controller");
const rss_module_1 = require("../rss/rss.module");
const feeds_entity_1 = require("./feeds.entity");
const collection_module_1 = require("../collections/collection.module");
let FeedsModule = class FeedsModule {
};
exports.FeedsModule = FeedsModule;
exports.FeedsModule = FeedsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([feeds_entity_1.Feed]), rss_module_1.RssModule, collection_module_1.CollectionsModule],
        controllers: [feeds_controller_1.FeedsController],
        providers: [feeds_service_1.FeedsService],
        exports: [feeds_service_1.FeedsService],
    })
], FeedsModule);
//# sourceMappingURL=feeds.module.js.map