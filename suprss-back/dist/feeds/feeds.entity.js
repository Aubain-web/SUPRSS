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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feed = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const collection_entity_1 = require("../collections/collection.entity");
const article_entity_1 = require("../articles/article.entity");
let Feed = class Feed {
    id;
    title;
    url;
    description;
    tags;
    updateFrequency;
    isActive;
    lastFetchedAt;
    lastErrorAt;
    lastError;
    createdAt;
    updatedAt;
    owner;
    ownerId;
    collection;
    collectionId;
    articles;
    favoritedBy;
};
exports.Feed = Feed;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Feed.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Feed.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Feed.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Feed.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: [] }),
    __metadata("design:type", Array)
], Feed.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3600 }),
    __metadata("design:type", Number)
], Feed.prototype, "updateFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Feed.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Feed.prototype, "lastFetchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Feed.prototype, "lastErrorAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Feed.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Feed.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Feed.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.feeds, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Feed.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Feed.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => collection_entity_1.Collection, (collection) => collection.feeds, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", collection_entity_1.Collection)
], Feed.prototype, "collection", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Feed.prototype, "collectionId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => article_entity_1.Article, (article) => article.feed, { cascade: true }),
    __metadata("design:type", Array)
], Feed.prototype, "articles", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, (user) => user.favoriteFeeds),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Feed.prototype, "favoritedBy", void 0);
exports.Feed = Feed = __decorate([
    (0, typeorm_1.Entity)('feeds')
], Feed);
//# sourceMappingURL=feeds.entity.js.map