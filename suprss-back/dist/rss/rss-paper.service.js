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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssParserService = void 0;
const common_1 = require("@nestjs/common");
const rss_parser_1 = __importDefault(require("rss-parser"));
let RssParserService = class RssParserService {
    parser;
    constructor() {
        this.parser = new rss_parser_1.default({
            timeout: 10000,
            headers: {
                'User-Agent': 'SUPRSS/1.0 RSS Reader',
                Accept: 'application/rss+xml, application/xml, text/xml',
            },
            customFields: {
                feed: ['language', 'copyright', 'managingEditor', 'webMaster', 'generator'],
                item: [
                    'summary',
                    'content',
                    'contentSnippet',
                    'enclosure',
                    'creator',
                    'author',
                    'categories',
                    ['media:thumbnail', 'media:thumbnail'],
                    ['media:content', 'media:content'],
                    ['content:encoded', 'content:encoded'],
                ],
            },
        });
    }
    async parseFeed(url) {
        return this.parser.parseURL(url);
    }
    async parseFeedFromString(xml) {
        return this.parser.parseString(xml);
    }
};
exports.RssParserService = RssParserService;
exports.RssParserService = RssParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RssParserService);
//# sourceMappingURL=rss-paper.service.js.map