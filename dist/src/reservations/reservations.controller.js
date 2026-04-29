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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const auth_guard_1 = require("../firebase/auth.guard");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    create(req, createReservationDto) {
        return this.reservationsService.create(req.user.uid, createReservationDto);
    }
    findForDoctor(req, doctorId, date) {
        if (doctorId) {
            return this.reservationsService.findForDoctor(doctorId, date, true);
        }
        return this.reservationsService.findForDoctor(req.user.uid, date, false);
    }
    findPaginatedForDoctor(req, date, page = '1', perPage = '3', nextOnly) {
        return this.reservationsService.findPaginatedForDoctor(req.user.uid, date, parseInt(page), parseInt(perPage), nextOnly === 'true');
    }
    findPaginatedForLab(req, date, page = '1', perPage = '3', nextOnly) {
        return this.reservationsService.findPaginatedForLab(req.user.uid, date, parseInt(page), parseInt(perPage), nextOnly === 'true');
    }
    findForPatient(req) {
        return this.reservationsService.findForPatient(req.user.uid);
    }
    findUpcomingForPatient(req) {
        return this.reservationsService.findUpcomingForPatient(req.user.uid);
    }
    findPaginatedForPatient(req, page = '1', perPage = '3') {
        return this.reservationsService.findPaginatedForPatient(req.user.uid, parseInt(page), parseInt(perPage));
    }
    getLiveQueueForPatient(req, doctorId) {
        return this.reservationsService.getLiveQueueForPatient(req.user.uid, doctorId);
    }
    findOne(id) {
        return this.reservationsService.findOne(id);
    }
    findForLab(labId, date) {
        return this.reservationsService.findForLab(labId, date);
    }
    updateStatus(id, statusData) {
        return this.reservationsService.updateStatus(id, statusData);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('doctor'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('doctorId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findForDoctor", null);
__decorate([
    (0, common_1.Get)('doctor/paginated'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('per_page')),
    __param(4, (0, common_1.Query)('next_only')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findPaginatedForDoctor", null);
__decorate([
    (0, common_1.Get)('lab/paginated'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('per_page')),
    __param(4, (0, common_1.Query)('next_only')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findPaginatedForLab", null);
__decorate([
    (0, common_1.Get)('patient'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findForPatient", null);
__decorate([
    (0, common_1.Get)('patient/upcoming'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findUpcomingForPatient", null);
__decorate([
    (0, common_1.Get)('patient/paginated'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('per_page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findPaginatedForPatient", null);
__decorate([
    (0, common_1.Get)('patient/live-queue'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getLiveQueueForPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('lab/:labId'),
    __param(0, (0, common_1.Param)('labId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findForLab", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "updateStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map