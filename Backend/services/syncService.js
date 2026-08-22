const SyncOperation = require("../models/SyncOperation");
const familyService = require("./familyService");

const applyFamilyOperation = async (userId, operation) => {
  const payload = operation.payload || {};

  switch (operation.action) {
    case "upsert":
      return familyService.createOrUpdateFamily(userId, payload.members);
    case "add_member":
      return familyService.addFamilyMember(userId, payload);
    case "update_member":
      return familyService.updateFamilyMember(userId, payload.memberId, payload.member);
    case "delete_member":
      return familyService.deleteFamilyMember(userId, payload.memberId);
    case "update_safety":
      return familyService.updateSafetyStatus(userId, payload.memberId, payload.isSafe);
    default:
      throw new Error("Unsupported synchronization action");
  }
};

const processOperation = async (userId, deviceId, operation) => {
  const existing = await SyncOperation.findOne({
    user: userId,
    operationId: operation.operationId,
  });

  if (existing) {
    return {
      operationId: operation.operationId,
      status: "duplicate",
      resourceId: existing.resourceId,
      error: existing.error,
    };
  }

  try {
    const result = await applyFamilyOperation(userId, operation);
    const record = await SyncOperation.create({
      user: userId,
      deviceId,
      operationId: operation.operationId,
      resource: operation.resource,
      action: operation.action,
      payload: operation.payload || {},
      status: "applied",
      resourceId: result?._id || null,
      result,
      clientCreatedAt: operation.clientCreatedAt || null,
    });

    return {
      operationId: operation.operationId,
      status: record.status,
      resourceId: record.resourceId,
    };
  } catch (error) {
    try {
      await SyncOperation.create({
        user: userId,
        deviceId,
        operationId: operation.operationId,
        resource: operation.resource,
        action: operation.action,
        payload: operation.payload || {},
        status: "rejected",
        error: error.message,
        clientCreatedAt: operation.clientCreatedAt || null,
      });
    } catch (recordError) {
      if (recordError.code !== 11000) throw recordError;
    }

    return {
      operationId: operation.operationId,
      status: "rejected",
      error: error.message,
    };
  }
};

const processBatch = async (userId, deviceId, operations) => {
  const accepted = [];
  const rejected = [];

  for (const operation of operations) {
    const result = await processOperation(userId, deviceId, operation);
    if (["applied", "duplicate"].includes(result.status)) {
      accepted.push(result);
    } else {
      rejected.push(result);
    }
  }

  return {
    accepted,
    rejected,
    serverTime: new Date().toISOString(),
  };
};

module.exports = { processBatch };