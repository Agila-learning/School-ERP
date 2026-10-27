import { Request, Response } from 'express';
import { eventCoreService } from '../services/EventCore.service';
import { eventWorkflowService } from '../services/EventWorkflow.service';
import { eventCompetitionService } from '../services/EventCompetition.service';
import { eventTripService } from '../services/EventTrip.service';
import { sendResponse } from '../../../core/utils/response.util';

export class EventsController {
  
  async createEvent(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const data = { ...req.body, tenantId: userReq.user.tenantId };
      const event = await eventCoreService.createEvent(userReq.user.tenantId, data);
      return sendResponse({ res, data: event, message: 'Event created successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const events = await eventCoreService.getEvents(userReq.user.tenantId, req.query);
      return sendResponse({ res, data: events });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async approveEvent(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const event = await eventWorkflowService.approveEvent(userReq.user.tenantId, req.params.id as string, userReq.user._id);
      return sendResponse({ res, data: event, message: 'Event approved' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async publishEvent(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const event = await eventWorkflowService.publishEvent(userReq.user.tenantId, req.params.id as string);
      return sendResponse({ res, data: event, message: 'Event published and registration is open' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async registerParticipant(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const participant = await eventCoreService.registerParticipant(userReq.user.tenantId, req.params.id as string, req.body);
      return sendResponse({ res, data: participant, message: 'Participant registered' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getEventStats(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const tenantId = userReq.user.tenantId;
      // Fetch basic stats for the dashboard
      const activeEventsCount = await require('../models/SchoolEventCore.model').SchoolEvent.countDocuments({ tenantId, status: { $in: ['Published', 'Registration Open', 'In Progress'] } });
      const pendingCount = await require('../models/SchoolEventCore.model').SchoolEvent.countDocuments({ tenantId, status: 'Draft' });
      const participantCount = await require('../models/EventParticipation.model').EventParticipant.countDocuments({ tenantId });
      
      const stats = {
        activeEvents: activeEventsCount,
        totalParticipants: participantCount,
        pendingApprovals: pendingCount
      };
      
      return sendResponse({ res, data: stats });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // --- Competition ---
  async createCompetition(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const comp = await eventCompetitionService.createCompetition(userReq.user.tenantId, req.params.eventId as string, req.body);
      return sendResponse({ res, data: comp, message: 'Competition created' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getCompetitions(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const comps = await require('../models/EventCompetition.model').Competition.find({ tenantId: userReq.user.tenantId, eventId: req.params.eventId });
      return sendResponse({ res, data: comps });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async registerTeam(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const team = await eventCompetitionService.registerTeam(userReq.user.tenantId, req.params.competitionId as string, req.body);
      return sendResponse({ res, data: team, message: 'Team registered' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getTeams(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const teams = await require('../models/EventCompetition.model').EventTeam.find({ tenantId: userReq.user.tenantId, competitionId: req.params.competitionId });
      return sendResponse({ res, data: teams });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async recordScore(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const score = await eventCompetitionService.recordScore(userReq.user.tenantId, { ...req.body, competitionId: req.params.competitionId });
      return sendResponse({ res, data: score, message: 'Score recorded' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getScores(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const scores = await require('../models/EventCompetition.model').CompetitionScore.find({ tenantId: userReq.user.tenantId, competitionId: req.params.competitionId });
      return sendResponse({ res, data: scores });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const eventsController = new EventsController();
