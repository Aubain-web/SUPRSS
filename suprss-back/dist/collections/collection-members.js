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
exports.CollectionMember = exports.Permission = void 0;
const typeorm_1 = require("typeorm");
const collection_entity_1 = require("./collection.entity");
const user_entity_1 = require("../user/user.entity");
var Permission;
(function (Permission) {
    Permission["READ"] = "read";
    Permission["ADD_FEED"] = "add_feed";
    Permission["EDIT_FEED"] = "edit_feed";
    Permission["DELETE_FEED"] = "delete_feed";
    Permission["COMMENT"] = "comment";
    Permission["ADMIN"] = "admin";
})(Permission || (exports.Permission = Permission = {}));
let CollectionMember = class CollectionMember {
    id;
    permissions;
    isActive;
    joinedAt;
    user;
    userId;
    collection;
    collectionId;
};
exports.CollectionMember = CollectionMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CollectionMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], CollectionMember.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CollectionMember.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CollectionMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.collectionMemberships, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], CollectionMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CollectionMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => collection_entity_1.Collection, (collection) => collection.members, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", collection_entity_1.Collection)
], CollectionMember.prototype, "collection", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CollectionMember.prototype, "collectionId", void 0);
exports.CollectionMember = CollectionMember = __decorate([
    (0, typeorm_1.Entity)('collection_members')
], CollectionMember);
//# sourceMappingURL=collection-members.js.map