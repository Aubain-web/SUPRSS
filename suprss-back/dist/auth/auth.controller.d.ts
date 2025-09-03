import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.register.dto';
import { LoginDto } from './dto/auth.login.dto';
import { User } from '../user/user.entity';
import { RequestWithUser } from '../common/express-request-user';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            isActive: boolean;
            messages: import("../message/message.entity").Message[];
            createdAt: Date;
            updatedAt: Date;
            feeds: import("../feeds/feeds.entity").Feed[];
            comments: import("../comment/comment.entity").Comment[];
            email: string;
            firstName: string;
            lastName: string;
            googleId: string | null;
            githubId: string | null;
            microsoftId: string | null;
            avatar: string | null;
            darkMode: boolean;
            fontSize: string;
            language: string;
            ownedCollections: import("../collections/collection.entity").Collection[];
            collectionMemberships: import("../collections/collection-members").CollectionMember[];
            favoriteFeeds: import("../feeds/feeds.entity").Feed[];
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            isActive: boolean;
            messages: import("../message/message.entity").Message[];
            createdAt: Date;
            updatedAt: Date;
            feeds: import("../feeds/feeds.entity").Feed[];
            comments: import("../comment/comment.entity").Comment[];
            email: string;
            firstName: string;
            lastName: string;
            googleId: string | null;
            githubId: string | null;
            microsoftId: string | null;
            avatar: string | null;
            darkMode: boolean;
            fontSize: string;
            language: string;
            ownedCollections: import("../collections/collection.entity").Collection[];
            collectionMemberships: import("../collections/collection-members").CollectionMember[];
            favoriteFeeds: import("../feeds/feeds.entity").Feed[];
        };
        token: string;
    }>;
    getProfile(user: User): User;
    googleAuth(): Promise<void>;
    googleCallback(req: RequestWithUser, res: Response): Promise<void>;
    githubAuth(): Promise<void>;
    githubCallback(req: RequestWithUser, res: Response): Promise<void>;
}
