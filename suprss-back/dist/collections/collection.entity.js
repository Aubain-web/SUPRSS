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
exports.Collection = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const feeds_entity_1 = require("../feeds/feeds.entity");
const collection_members_1 = require("./collection-members");
const message_entity_1 = require("../message/message.entity");
let Collection = class Collection {
    id;
    name;
    description;
    isPublic;
    inviteCode;
    createdAt;
    updatedAt;
    owner;
    ownerId;
    feeds;
    members;
    messages;
};
exports.Collection = Collection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Collection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Collection.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "inviteCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Collection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Collection.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ownedCollections, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], Collection.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Collection.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => feeds_entity_1.Feed, (feed) => feed.collection),
    __metadata("design:type", Array)
], Collection.prototype, "feeds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => collection_members_1.CollectionMember, (member) => member.collection),
    __metadata("design:type", Array)
], Collection.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.collection),
    __metadata("design:type", Array)
], Collection.prototype, "messages", void 0);
exports.Collection = Collection = __decorate([
    (0, typeorm_1.Entity)('collection')
], Collection);
//# sourceMappingURL=collection.entity.js.map