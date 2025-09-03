"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    users;
    jwt;
    constructor(users, jwt) {
        this.users = users;
        this.jwt = jwt;
    }
    sign(user) {
        return this.jwt.sign({ sub: user.id, email: user.email });
    }
    toSafeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }
    async register(dto) {
        const existing = await this.users.findByEmail(dto.email);
        if (existing) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.users.create({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            password: hashed,
        });
        const token = this.sign(user);
        return { user: this.toSafeUser(user), token };
    }
    async validateUser(email, password) {
        const user = await this.users.findByEmail(email);
        if (!user || !user.password)
            return null;
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return null;
        return user;
    }
    async login(dto) {
        const user = await this.validateUser(dto.email, dto.password);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.sign(user);
        return { user: this.toSafeUser(user), token };
    }
    async validateUserByJwt(payload) {
        const user = (await this.users.findById(payload.sub)) ?? (await this.users.findOne(payload.sub));
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.toSafeUser(user);
    }
    async handleOAuthLogin(profile, provider) {
        const email = profile?.emails?.[0]?.value ?? profile?.email;
        if (!email)
            throw new common_1.UnauthorizedException('Email introuvable via OAuth');
        let user = await this.users.findByEmail(email);
        if (!user) {
            user = await this.users.create({
                email,
                firstName: profile?.name?.givenName || 'OAuth',
                lastName: profile?.name?.familyName || provider,
                avatar: profile?.photos?.[0]?.value ?? undefined,
            });
        }
        const token = this.sign(user);
        return { user: this.toSafeUser(user), token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map