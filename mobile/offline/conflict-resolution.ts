export const ConflictResolver = {
  resolveServerWins<T extends { updatedAt?: string }>(localData: T, remoteData: T): T {
    if (!localData.updatedAt || !remoteData.updatedAt) return remoteData;
    return new Date(localData.updatedAt) > new Date(remoteData.updatedAt) ? localData : remoteData;
  }
};
