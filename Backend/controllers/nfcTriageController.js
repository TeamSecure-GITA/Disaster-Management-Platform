/**
 * Web-NFC "Digital Triage Stamps" Controller
 * 
 * Manages synchronized triage records originating from skin-safe, waterproof
 * NFC tags (NDEF records) worn by mass-casualty victims in zero-grid field hospitals.
 */

let syncedTriageRecords = [
  {
    patientId: "VIC-NER-9912",
    nfcTagSerial: "04:5A:21:8F:CC:90:80",
    triageCategory: "RED_IMMEDIATE",
    fullName: "Tenzing Norbu",
    bloodGroup: "O_POSITIVE",
    allergies: ["Penicillin", "Sulfa drugs"],
    vitals: {
      heartRateBpm: 128,
      spO2Percent: 88,
      systolicBp: 85,
      glasgowComaScale: 11
    },
    primaryDiagnosis: "Compound Femur Fracture & Traumatic Hemorrhagic Shock",
    appliedInterventions: [
      { time: "14:22", action: "Combat Application Tourniquet (CAT) Right Thigh", medic: "PARAMEDIC_KUMAR" },
      { time: "14:35", action: "Tranexamic Acid (TXA) 1g IV Infusion", medic: "DR_R_SHARMA" },
      { time: "14:50", action: "High-Flow Oxygen Mask 12 L/min", medic: "VOLUNTEER_AID_04" }
    ],
    lastUpdatedOffline: new Date(Date.now() - 1800000).toISOString(),
    fieldHospitalUnit: "NDRF Field Surgical Facility (Zone C)"
  },
  {
    patientId: "VIC-NER-9915",
    nfcTagSerial: "04:8B:11:4E:99:32:81",
    triageCategory: "YELLOW_DELAYED",
    fullName: "Millo Hina",
    bloodGroup: "A_POSITIVE",
    allergies: ["None known"],
    vitals: {
      heartRateBpm: 94,
      spO2Percent: 96,
      systolicBp: 118,
      glasgowComaScale: 14
    },
    primaryDiagnosis: "Closed Rib Fractures & Silt Inhalation Hypoxia",
    appliedInterventions: [
      { time: "13:45", action: "Chest Splinting & Oral Rehydration Salts", medic: "NURSE_DEVI" }
    ],
    lastUpdatedOffline: new Date(Date.now() - 4200000).toISOString(),
    fieldHospitalUnit: "Pangsu Pass Transit Shelter"
  }
];

// GET /api/nfc-triage/patients
exports.getTriagePatients = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: syncedTriageRecords.length,
      data: syncedTriageRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/nfc-triage/batch-sync
exports.batchSyncTriageTags = async (req, res) => {
  try {
    const { scannedTags, fieldStationId = "BASE_HOSPITAL_GATEWAY" } = req.body;

    if (!Array.isArray(scannedTags) || scannedTags.length === 0) {
      return res.status(400).json({ success: false, message: "scannedTags array is required" });
    }

    const newlySynced = [];
    for (const tag of scannedTags) {
      const existingIdx = syncedTriageRecords.findIndex(r => r.patientId === tag.patientId);
      if (existingIdx >= 0) {
        syncedTriageRecords[existingIdx] = { ...syncedTriageRecords[existingIdx], ...tag, syncedAt: new Date().toISOString() };
        newlySynced.push(syncedTriageRecords[existingIdx]);
      } else {
        const record = { ...tag, syncedAt: new Date().toISOString(), fieldHospitalUnit: fieldStationId };
        syncedTriageRecords.unshift(record);
        newlySynced.push(record);
      }
    }

    return res.status(200).json({
      success: true,
      syncedCount: newlySynced.length,
      records: newlySynced
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
