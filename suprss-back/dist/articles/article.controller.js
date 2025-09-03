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
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const article_service_1 = require("./article.service");
const user_entity_1 = require("../user/user.entity");
const update_article_dto_1 = require("./dto/update-article.dto");
const Jwt_auth_guard_1 = require("../auth/Jwt.auth.guard");
const current_user_1 = require("../common/current-user");
let ArticlesController = class ArticlesController {
    articlesService;
    constructor(articlesService) {
        this.articlesService = articlesService;
    }
    findAll(user, feedIds, categories, isRead, isFavorite, search, startDate, endDate, page, limit) {
        const filters = {};
        if (feedIds)
            filters.feedIds = feedIds.split(',');
        if (categories)
            filters.categories = categories.split(',');
        if (isRead !== undefined)
            filters.isRead = isRead === 'true';
        if (isFavorite !== undefined)
            filters.isFavorite = isFavorite === 'true';
        if (search)
            filters.search = search;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (page)
            filters.page = page;
        if (limit)
            filters.limit = limit;
        return this.articlesService.findAll(user, filters);
    }
    getUnreadCount(user) {
        return this.articlesService.getUnreadCount(user);
    }
    getFavorites(user) {
        return this.articlesService.getFavorites(user);
    }
    findOne(id, user) {
        return this.articlesService.findOne(id, user);
    }
    update(id, updateArticleDto, user) {
        return this.articlesService.update(id, updateArticleDto, user);
    }
    remove(id, user) {
        return this.articlesService.remove(id, user);
    }
    markAsRead(id, user) {
        return this.articlesService.markAsRead(id, user);
    }
    markAsUnread(id, user) {
        return this.articlesService.markAsUnread(id, user);
    }
    toggleFavorite(id, user) {
        return this.articlesService.toggleFavorite(id, user);
    }
    markAllAsRead(feedIds, user) {
        return this.articlesService.markAllAsRead(feedIds, user);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('feedIds')),
    __param(2, (0, common_1.Query)('categories')),
    __param(3, (0, common_1.Query)('isRead')),
    __param(4, (0, common_1.Query)('isFavorite')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(9, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('favorites'),
    __param(0, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_article_dto_1.UpdateArticleDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "markAsUnread", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    __param(0, (0, common_1.Body)('feedIds')),
    __param(1, (0, current_user_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "markAllAsRead", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, common_1.Controller)('articles'),
    (0, common_1.UseGuards)(Jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [article_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=article.controller.js.map