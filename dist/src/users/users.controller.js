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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const auth_guard_1 = require("../firebase/auth.guard");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async syncProfile(req, profileData) {
        const uid = req.user.uid;
        const email = req.user.email;
        try {
            return await this.usersService.update(uid, profileData);
        }
        catch (e) {
            return await this.usersService.create({ ...profileData, uid, email });
        }
    }
    getProfile(req) {
        return this.usersService.findByUid(req.user.uid);
    }
    updateProfile(req, updateData) {
        return this.usersService.update(req.user.uid, updateData);
    }
    updateFcmToken(req, fcmToken) {
        return this.usersService.updateFcmToken(req.user.uid, fcmToken);
    }
    getPatientActivity(req, page = '1', perPage = '10') {
        return this.usersService.getPatientActivity(req.user.uid, parseInt(page), parseInt(perPage));
    }
    getPatientAnalysis(req, page = '1', perPage = '3') {
        return this.usersService.getPaginatedAnalysis(req.user.uid, parseInt(page), parseInt(perPage));
    }
    deleteAnalysis(req, fileId) {
        return this.usersService.deleteAnalysisFile(req.user.uid, fileId);
    }
    getPatientFullProfile(patientId) {
        return this.usersService.getPatientFullProfile(patientId);
    }
    getPatientActivityByDoctor(patientId, page = '1', perPage = '10') {
        return this.usersService.getPatientActivityByPatientId(patientId, parseInt(page), parseInt(perPage));
    }
    getPatientAnalysisByDoctor(patientId, page = '1', perPage = '10') {
        return this.usersService.getPaginatedAnalysisByPatientId(patientId, parseInt(page), parseInt(perPage));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "syncProfile", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('fcm-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('fcmToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateFcmToken", null);
__decorate([
    (0, common_1.Get)('patient/activity'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('per_page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPatientActivity", null);
__decorate([
    (0, common_1.Get)('patient/analysis'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('per_page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPatientAnalysis", null);
__decorate([
    (0, common_1.Delete)('patient/analysis/:fileId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteAnalysis", null);
__decorate([
    (0, common_1.Get)('patient/:patientId/full-profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPatientFullProfile", null);
__decorate([
    (0, common_1.Get)('patient/:patientId/activity'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('per_page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPatientActivityByDoctor", null);
__decorate([
    (0, common_1.Get)('patient/:patientId/analysis'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('per_page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPatientAnalysisByDoctor", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map