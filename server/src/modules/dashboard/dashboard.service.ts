import mongoose from "mongoose";
import { Training, ITraining } from "../../models/training.model";
import { Attendance } from "../../models/attendance.model";
import { Transaction } from "../../models/transaction.model";
import { ClubMembership } from "../../models/clubMembership.model";
import { Registration } from "../../models/registration.model";
import { Club } from "../../models/club.model";
import { ApiError } from "../../shared/utils/ApiError";
import {
  TrainingStatus,
  AttendanceStatus,
  RegistrationStatus,
  MembershipStatus,
} from "../../shared/enums";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

interface DashboardResult {
  kpis: {
    totalFormations: number;
    formationsTerminees: number;
    formationsEnCours: number;
    inscriptionsEnAttente: number;
  };
  analytics: Array<{ day: string; checkIns: number; checkOuts: number; incomplete: number }>;
  nextTraining: any;
  upcoming: any[];
  members: {
    recentMemberships: any[];
    pendingRequests: number;
    recentRegistrations: any[];
  };
  finance: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    recentTransactions: any[];
  };
  activeSession: any;
  recentRegistrations: any[];
}

export async function getClubDashboard(clubId: string, userId: string): Promise<DashboardResult> {
  const club = await Club.findById(clubId).lean();
  if (!club) throw ApiError.notFound("Club not found");

  if (club.leader?.toString() !== userId) {
    throw ApiError.forbidden("You are not the leader of this club");
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const [
    totalFormations,
    formationsTerminees,
    formationsEnCours,
    inscriptionsEnAttente,
    weeklyAttendance,
    nextTraining,
    upcomingTrainings,
    recentMemberships,
    pendingRegistrations,
    financeSummary,
    recentTransactions,
    activeSession,
  ] = await Promise.all([
    Training.countDocuments({ club: clubId }),
    Training.countDocuments({ club: clubId, status: TrainingStatus.COMPLETED }),
    Training.countDocuments({ club: clubId, status: TrainingStatus.IN_PROGRESS }),
    Registration.countDocuments({
      targetType: "training",
      status: RegistrationStatus.PENDING,
    }).then(async (count) => {
      const trainingIds = await Training.find({ club: clubId })
        .select("_id")
        .lean()
        .then((ts) => ts.map((t) => t._id));
      return Registration.countDocuments({
        targetId: { $in: trainingIds },
        status: RegistrationStatus.PENDING,
      });
    }),

    // Weekly attendance analytics
    Attendance.aggregate([
      {
        $lookup: {
          from: "trainings",
          localField: "training",
          foreignField: "_id",
          as: "trainingDoc",
        },
      },
      { $unwind: "$trainingDoc" },
      { $match: { "trainingDoc.club": new mongoose.Types.ObjectId(clubId) } },
      {
        $lookup: {
          from: "attendancesessions",
          localField: "training",
          foreignField: "training",
          as: "session",
        },
      },
      {
        $addFields: {
          weekDay: { $dayOfWeek: "$checkIn.time" },
        },
      },
      {
        $match: {
          "checkIn.time": { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$checkIn.time" },
          },
          checkIns: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [AttendanceStatus.CHECKED_IN, AttendanceStatus.CHECKED_OUT],
                  ],
                },
                1,
                0,
              ],
            },
          },
          checkOuts: {
            $sum: {
              $cond: [{ $eq: ["$status", AttendanceStatus.CHECKED_OUT] }, 1, 0],
            },
          },
          incomplete: {
            $sum: {
              $cond: [{ $eq: ["$status", AttendanceStatus.INCOMPLETE] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]),

    // Next upcoming training
    Training.findOne({
      club: clubId,
      date: { $gte: now.toISOString().split("T")[0] },
      status: {
        $in: [
          TrainingStatus.PUBLISHED,
          TrainingStatus.REGISTRATION_OPEN,
          TrainingStatus.REGISTRATION_CLOSED,
        ],
      },
    })
      .sort({ date: 1, startTime: 1 })
      .lean()
      .then(async (t) => {
        if (!t) return null;
        const regCount = await Registration.countDocuments({
          targetId: t._id,
          status: {
            $in: [RegistrationStatus.APPROVED, RegistrationStatus.PENDING],
          },
        });
        return { ...t, registrationCount: regCount };
      }),

    // Upcoming trainings
    Training.find({
      club: clubId,
      date: { $gte: now.toISOString().split("T")[0] },
      status: {
        $in: [
          TrainingStatus.PUBLISHED,
          TrainingStatus.REGISTRATION_OPEN,
          TrainingStatus.REGISTRATION_CLOSED,
        ],
      },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(5)
      .lean(),

    // Recent memberships
    ClubMembership.find({ club: clubId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Pending membership registrations
    Registration.find({
      targetType: "membership",
      status: RegistrationStatus.PENDING,
    })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Finance summary
    Transaction.aggregate([
      { $match: { club: new mongoose.Types.ObjectId(clubId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]).then((results) => {
      const income = results.find((r) => r._id === "income")?.total || 0;
      const expenses = results.find((r) => r._id === "expense")?.total || 0;
      return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }),

    // Recent transactions
    Transaction.find({ club: clubId })
      .populate("recordedBy", "firstName lastName")
      .sort({ date: -1 })
      .limit(5)
      .lean(),

    // Active attendance session
    Attendance.aggregate([
      {
        $lookup: {
          from: "trainings",
          localField: "training",
          foreignField: "_id",
          as: "trainingDoc",
        },
      },
      { $unwind: "$trainingDoc" },
      {
        $match: {
          "trainingDoc.club": new mongoose.Types.ObjectId(clubId),
          "trainingDoc.status": TrainingStatus.IN_PROGRESS,
        },
      },
      {
        $group: {
          _id: "$training",
          total: { $sum: 1 },
          checkedIn: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [AttendanceStatus.CHECKED_IN, AttendanceStatus.CHECKED_OUT],
                  ],
                },
                1,
                0,
              ],
            },
          },
          checkedOut: {
            $sum: {
              $cond: [{ $eq: ["$status", AttendanceStatus.CHECKED_OUT] }, 1, 0],
            },
          },
          incomplete: {
            $sum: {
              $cond: [{ $eq: ["$status", AttendanceStatus.INCOMPLETE] }, 1, 0],
            },
          },
          notAttended: {
            $sum: {
              $cond: [
                { $eq: ["$status", AttendanceStatus.NOT_ATTENDED] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "trainings",
          localField: "_id",
          foreignField: "_id",
          as: "training",
        },
      },
      { $unwind: "$training" },
      {
        $project: {
          _id: 1,
          total: 1,
          checkedIn: 1,
          checkedOut: 1,
          incomplete: 1,
          notAttended: 1,
          "training.title": 1,
          "training.date": 1,
          "training.startTime": 1,
          "training.endTime": 1,
          "training.location": 1,
        },
      },
    ]).then((r) => r[0] || null),

    // Recent registrations for upcoming trainings
    Registration.find({
      targetType: "training",
      status: RegistrationStatus.PENDING,
    })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const dayMap: Record<number, string> = {
    1: "Lun",
    2: "Mar",
    3: "Mer",
    4: "Jeu",
    5: "Ven",
    6: "Sam",
    7: "Dim",
  };
  const analytics = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
    (day) => {
      const entry = weeklyAttendance.find(
        (w: any) => dayMap[w._id.day] === day
      );
      return {
        day,
        checkIns: entry?.checkIns || 0,
        checkOuts: entry?.checkOuts || 0,
        incomplete: entry?.incomplete || 0,
      };
    }
  );

  return {
    kpis: {
      totalFormations,
      formationsTerminees,
      formationsEnCours,
      inscriptionsEnAttente,
    },
    analytics,
    nextTraining,
    upcoming: upcomingTrainings,
    members: {
      recentMemberships,
      pendingRequests: inscriptionsEnAttente,
      recentRegistrations: pendingRegistrations,
    },
    finance: {
      ...financeSummary,
      recentTransactions,
    },
    activeSession,
    recentRegistrations: pendingRegistrations,
  };
}
