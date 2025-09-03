"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsController = void 0;
const common_1 = require("@nestjs/common");
const feeds_service_1 = require("./feeds.service");
const create_feed_dto_1 = require("./dto/create-feed.dto");
const update_feed_dto_1 = require("./dto/update-feed.dto");
const user_entity_1 = require("../user/user.entity");
const Jwt_auth_guard_1 = require("../auth/Jwt.auth.guard");
const current_user_1 = require("../common/current-user");
let FeedsController = class FeedsController {
    feedsService;
    constructor(feedsService) {
        this.feedsService = feedsService;
    }
    create(createFeedDto, user) {
        return this.feedsService.create(createFeedDto, user);
    }
    findAll(user, collectionId) {
        return this.feedsService.findAll(user, collectionId);
    }
    getFavorites(user) {
        return this.feedsService.getFavorites(user);
    }
    findByTags(tags, user) {
        const tagArray = tags.split(',').map((tag) => tag.trim());
        return this.feedsService.findByTags(tagArray, user);
    }
    findOne(id, user) {
        return this.feedsService.findOne(id, user);
    }
    update(id, updateFeedDto, user) {
        return this.feedsService.update(id, updateFeedDto, user);
    }
    remove(id, user) {
        return this.feedsService.remove(id, user);
    }
    toggleFavorite(id, user) {
        return this.feedsService.toggleFavorite(id, user);
    }
};
exports.FeedsController = FeedsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_feed_dto_1.CreateFeedDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('collectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('favorites'),
    __param(0, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)('by-tags'),
    __param(0, (0, common_1.Query)('tags')),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "findByTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_feed_dto_1.UpdateFeedDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], FeedsController.prototype, "toggleFavorite", null);
exports.FeedsController = FeedsController = __decorate([
    (0, common_1.Controller)('feeds'),
    (0, common_1.UseGuards)(Jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [feeds_service_1.FeedsService])
], FeedsController);
//# sourceMappingURL=feeds.controller.js.map