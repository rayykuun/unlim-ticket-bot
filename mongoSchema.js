const mongoose = require("mongoose");

const moderatorSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const Moderator = mongoose.model("Moderator", moderatorSchema);

const logChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
  },
});
const LogChannel = mongoose.model("LogChannel", logChannelSchema);

const kickLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  moderatorId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const KickLog = mongoose.model("KickLog", kickLogSchema);

const banLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  moderatorId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const BanLog = mongoose.model("BanLog", banLogSchema);

const warnLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  moderatorId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WarnLog = mongoose.model("WarnLog", warnLogSchema);

const userXPSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const UserXP = mongoose.model("UserXP", userXPSchema);

const levelRewardSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
});

const LevelReward = mongoose.model("LevelReward", levelRewardSchema);

const messageLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  oldContent: {
    type: String,
    required: true,
  },
  newContent: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const MessageLog = mongoose.model("MessageLog", messageLogSchema);

const deletedMessageLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const DeletedMessageLog = mongoose.model(
  "DeletedMessageLog",
  deletedMessageLogSchema
);

const memberLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  discordJoined: {
    type: Date,
    required: true,
  },
  serverJoins: [
    {
      guildId: {
        type: String,
        required: true,
      },
      joinedAt: {
        type: Date,
        required: true,
      },
    },
  ],
  serverLeaves: [
    {
      guildId: {
        type: String,
        required: true,
      },
      leftAt: {
        type: Date,
        required: true,
      },
    },
  ],
});

const MemberLog = mongoose.model("MemberLog", memberLogSchema);

const memberUpdateLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  oldNickname: {
    type: String,
  },
  newNickname: {
    type: String,
  },
  oldRoles: [
    {
      type: String,
    },
  ],
  newRoles: [
    {
      type: String,
    },
  ],
  timestamp: {
    type: Date,
    required: true,
  },
});

const MemberUpdateLog = mongoose.model(
  "MemberUpdateLog",
  memberUpdateLogSchema
);
const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  openedBy: {
    type: String,
    required: true,
  },
  openedAt: {
    type: Date,
    default: Date.now,
  },
  channelId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "open",
  },
  closedBy: {
    type: String,
  },
  closedAt: {
    type: Date,
  },
  transcript: {
    type: String,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

const autoResponseSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  trigger: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AutoResponse = mongoose.model("AutoResponse", autoResponseSchema);

const userResponseSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserResponse = mongoose.model("UserResponse", userResponseSchema);

module.exports = {
  Moderator,
  LogChannel,
  KickLog,
  BanLog,
  WarnLog,
  UserXP,
  LevelReward,
  MessageLog,
  DeletedMessageLog,
  MemberLog,
  MemberUpdateLog,
  Ticket,
  AutoResponse,
  UserResponse,
};
