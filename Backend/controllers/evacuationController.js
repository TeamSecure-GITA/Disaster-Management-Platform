const Shelter = require("../models/Shelter");
const User = require("../models/User");
const Notification = require("../models/Notification");
const pushNotificationService = require("../services/pushNotificationService");
const { sendSMS } = require("../services/smsService");
const { getIO } = require("../sockets/socket");

// Haversine distance in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
};

const HAZARD_GUIDANCE = {
    Flood: {
        hazardWarning: "Flash floods cause rapid water level rise. Avoid low-lying underpasses, culverts, and floodplains.",
        routePriority: "Move to higher ground immediately. Never drive or walk through standing floodwater (Turn Around Don't Drown).",
        checklist: [
            "Pack 3-day drinking water & waterproof flashlight",
            "Turn off main electric circuit breaker and gas valve before leaving",
            "Carry prescription medicines and vital identity documents in ziplock pouches",
            "Wear waterproof footwear and avoid fallen power cables",
            "Monitor State Disaster Management Authority (1070) updates",
        ],
    },
    Cyclone: {
        hazardWarning: "Severe gales, flying debris, and storm surges. Stay away from glass facades, tin roofs, and coastal borders.",
        routePriority: "Head to designated reinforced pucca cyclone shelters immediately before landfall.",
        checklist: [
            "Fully charge mobile phones and power banks",
            "Keep battery-operated emergency radio tuned to IMD alerts",
            "Secure loose outdoor items before evacuation",
            "Bring emergency blankets, dry ration bars, and infant milk",
            "Call 112 or 1077 (District Disaster Control) if stranded",
        ],
    },
    Earthquake: {
        hazardWarning: "Structural collapses, gas leaks, and strong aftershocks.",
        routePriority: "Move to designated open spaces, wide grounds, or low-density safety camps away from high-rises and overhead powerlines.",
        checklist: [
            "Drop, Cover, and Hold On during active tremors; evacuate only when shaking ceases",
            "Do NOT use elevators under any circumstances",
            "Check for gas leaks before using flashlights or matches",
            "Carry emergency first-aid kit, whistle, and warm clothing",
            "Watch out for falling masonry and overhead glass during movement",
        ],
    },
    Fire: {
        hazardWarning: "Toxic smoke inhalation, extreme heat, and rapid flashover.",
        routePriority: "Move upwind and downhill away from the fire perimeter. Use designated arterial evacuation routes.",
        checklist: [
            "Crawl low under smoke; cover nose and mouth with a damp cloth",
            "Feel doors with the back of your hand before opening",
            "Never re-enter a burning or heat-damaged building",
            "Call 101 or 112 immediately to report fire coordinates",
            "Assemble at the designated community safety field",
        ],
    },
    Tsunami: {
        hazardWarning: "Multiple destructive waves travelling at jet speed. Receding shorelines signal immediate danger.",
        routePriority: "Evacuate inland and at least 30 meters above sea level or 2+ kilometers inland.",
        checklist: [
            "Do not wait for official warnings if strong tremors are felt near coast",
            "Abandon personal possessions; speed of evacuation is critical",
            "Move on foot if roads are congested with vehicles",
            "Stay away from coastlines until an official 'All Clear' is sounded",
        ],
    },
};

const generateEvacuationPlan = async (req, res, next) => {
    try {
        const {
            currentLocation,
            disasterType = "Flood",
            emergencyLevel = "high",
            transportMode = "driving", // 'driving' | 'walking'
        } = req.body;

        if (!currentLocation) {
            return res.status(400).json({
                success: false,
                message: "Current location is required",
            });
        }

        // Parse coordinates if available
        let userLat = null;
        let userLng = null;

        if (typeof currentLocation === "object") {
            userLat = currentLocation.latitude || currentLocation.lat;
            userLng = currentLocation.longitude || currentLocation.lng;
        } else if (typeof currentLocation === "string" && currentLocation.includes(",")) {
            const parts = currentLocation.split(",").map((p) => parseFloat(p.trim()));
            if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                userLat = parts[0];
                userLng = parts[1];
            }
        }

        // Fetch active shelters from MongoDB
        let shelters = await Shelter.find({ status: { $ne: "closed" } }).lean();

        // Calculate distances if coordinates are provided
        if (userLat !== null && userLng !== null && shelters.length > 0) {
            shelters = shelters.map((s) => {
                const sLat = s.location?.coordinates?.[1];
                const sLng = s.location?.coordinates?.[0];
                const distanceKm =
                    sLat && sLng ? calculateDistanceKm(userLat, userLng, sLat, sLng) : 999;
                return {
                    ...s,
                    distanceKm,
                };
            });

            shelters.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        const primaryShelter = shelters[0] || {
            name: "District Emergency Safe Assembly Zone",
            address: "Central Collectorate & Relief Ground",
            city: "Bhubaneswar",
            contactNumber: "112",
            distanceKm: 3.5,
            location: { coordinates: [85.8245, 20.2961] },
        };

        const distKm = primaryShelter.distanceKm || 3.5;
        const walkTimeMin = Math.round((distKm / 4.5) * 60); // 4.5 km/h walking
        const driveTimeMin = Math.max(3, Math.round((distKm / 25) * 60)); // 25 km/h in storm traffic

        const sLng = primaryShelter.location?.coordinates?.[0] || 85.8245;
        const sLat = primaryShelter.location?.coordinates?.[1] || 20.2961;

        const mapsOrigin =
            userLat !== null && userLng !== null
                ? `${userLat},${userLng}`
                : encodeURIComponent(String(currentLocation));

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${mapsOrigin}&destination=${sLat},${sLng}&travelmode=${transportMode === "walking" ? "walking" : "driving"}`;

        const guidance = HAZARD_GUIDANCE[disasterType] || HAZARD_GUIDANCE.Flood;

        const plan = {
            disasterType,
            emergencyLevel,
            startLocation: currentLocation,
            destination: {
                id: primaryShelter._id,
                name: primaryShelter.name,
                address: primaryShelter.address,
                city: primaryShelter.city || "",
                contactNumber: primaryShelter.contactNumber || "112",
                capacity: primaryShelter.capacity,
                currentOccupancy: primaryShelter.currentOccupancy,
                availableSpots: primaryShelter.capacity
                    ? Math.max(0, primaryShelter.capacity - (primaryShelter.currentOccupancy || 0))
                    : "Available",
                latitude: sLat,
                longitude: sLng,
                distanceKm: distKm,
            },
            alternateShelters: shelters.slice(1, 4).map((s) => ({
                id: s._id,
                name: s.name,
                address: s.address,
                contactNumber: s.contactNumber || "112",
                distanceKm: s.distanceKm,
                latitude: s.location?.coordinates?.[1],
                longitude: s.location?.coordinates?.[0],
            })),
            estimatedTime: {
                drivingMinutes: driveTimeMin,
                walkingMinutes: walkTimeMin,
                distanceKm: distKm,
            },
            mapsUrl,
            hazardWarning: guidance.hazardWarning,
            routePriority: guidance.routePriority,
            evacuationPhases: [
                {
                    phase: 1,
                    title: "Immediate Readiness & Safeguards (0 - 10 min)",
                    actions: [
                        "Collect Grab-and-Go Emergency Kit and identification documents",
                        "Disconnect gas cylinders, water mains, and power switchboard",
                        "Ensure all family members wear secure footwear and ID cards",
                    ],
                },
                {
                    phase: 2,
                    title: "En-Route Transit & Hazard Avoidance",
                    actions: [
                        `Follow designated evacuation corridor toward ${primaryShelter.name}`,
                        guidance.routePriority,
                        "Do not divert into unmapped bypasses or submerged lanes",
                        "Tune into local disaster radio (AIR / FM) on mobile/transistor",
                    ],
                },
                {
                    phase: 3,
                    title: "Shelter Arrival & Check-In",
                    actions: [
                        `Register at ${primaryShelter.name} Reception Desk with family names`,
                        "Notify District Control (1077) or trigger 'I am Safe' in Family Safety",
                        "Report any injured or medical-priority family members immediately",
                    ],
                },
            ],
            checklist: guidance.checklist,
            emergencyHotlines: [
                { name: "National Emergency Helpline", number: "112" },
                { name: "Medical & Ambulance", number: "108" },
                { name: "State Disaster Authority (SDMA)", number: "1070" },
                { name: "District Disaster Control Room", number: "1077" },
                { name: "Women Safety & Helpline", number: "1091" },
            ],
            generatedAt: new Date().toISOString(),
        };

        res.status(200).json({
            success: true,
            message: "Evacuation plan generated successfully",
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/evacuation/citizen-unsafe-alert
 * Dispatches mobile push notification, SMS, and real-time high-decibel siren alarm
 * to a citizen who is unsafe or in a disaster danger zone, providing turn-by-turn map route
 * to the nearest safe shelter.
 */
const triggerCitizenUnsafeAlert = async (req, res, next) => {
    try {
        const {
            userId,
            citizenName = "Citizen",
            phone,
            currentLocation,
            hazardType = "Disaster Hazard",
            dangerSeverity = "critical",
            customMessage,
            triggerSiren = true,
        } = req.body;

        const effectiveUserId = userId || req.user?._id || null;

        // 1. Resolve coordinates
        let userLat = null;
        let userLng = null;

        if (typeof currentLocation === "object" && currentLocation) {
            userLat = Number(currentLocation.latitude || currentLocation.lat);
            userLng = Number(currentLocation.longitude || currentLocation.lng);
        } else if (typeof currentLocation === "string" && currentLocation.includes(",")) {
            const parts = currentLocation.split(",").map((p) => parseFloat(p.trim()));
            if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                userLat = parts[0];
                userLng = parts[1];
            }
        }

        // If coordinates still missing, attempt lookup from User document
        let userDoc = null;
        if (effectiveUserId) {
            userDoc = await User.findById(effectiveUserId).select("name phone fcmToken location").lean();
            if ((userLat === null || userLng === null) && userDoc?.location?.coordinates) {
                userLng = userDoc.location.coordinates[0];
                userLat = userDoc.location.coordinates[1];
            }
        }

        // Fallback coordinates (e.g. Bhubaneswar emergency center) if completely absent
        const finalLat = userLat !== null && !isNaN(userLat) && userLat !== 0 ? userLat : 20.2961;
        const finalLng = userLng !== null && !isNaN(userLng) && userLng !== 0 ? userLng : 85.8245;

        // 2. Query nearest safe shelter from MongoDB
        let shelters = await Shelter.find({ status: { $ne: "closed" } }).lean();

        if (shelters && shelters.length > 0) {
            shelters = shelters.map((s) => {
                const sLat = s.location?.coordinates?.[1];
                const sLng = s.location?.coordinates?.[0];
                const distanceKm = sLat && sLng ? calculateDistanceKm(finalLat, finalLng, sLat, sLng) : 999;
                return {
                    ...s,
                    distanceKm,
                    latitude: sLat,
                    longitude: sLng,
                };
            });
            shelters.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        const nearestShelter = shelters?.[0] || {
            _id: "default-shelter-1",
            name: "District Emergency Safe Refuge & Assembly Zone",
            address: "Central Collectorate & Relief Ground, Main Highway",
            city: "Bhubaneswar",
            contactNumber: "112",
            distanceKm: 2.1,
            capacity: 500,
            currentOccupancy: 120,
            latitude: 20.3015,
            longitude: 85.8312,
        };

        const distKm = nearestShelter.distanceKm || 2.1;
        const walkTimeMin = Math.max(2, Math.round((distKm / 4.5) * 60));
        const driveTimeMin = Math.max(1, Math.round((distKm / 25) * 60));

        const sLat = nearestShelter.latitude || nearestShelter.location?.coordinates?.[1] || 20.3015;
        const sLng = nearestShelter.longitude || nearestShelter.location?.coordinates?.[0] || 85.8312;

        // 3. Generate Turn-by-Turn Map Route URLs
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${finalLat},${finalLng}&destination=${sLat},${sLng}&travelmode=walking`;
        const platformRouteUrl = `/evacuation-planner?shelterId=${nearestShelter._id || ""}&origin=${finalLat},${finalLng}`;

        const recipientPhone = phone || userDoc?.phone || null;
        const recipientName = citizenName || userDoc?.name || "Citizen";

        const alertTitle = `🚨 CRITICAL DANGER: EVACUATE IMMEDIATELY!`;
        const alertBody = customMessage || `🚨 ${recipientName}, you are in an unsafe disaster hazard zone! Evacuate immediately to ${nearestShelter.name} (${distKm} km away, ~${walkTimeMin} mins walk). Tap for live turn-by-turn map route.`;

        // 4. Send Mobile Push Notification (FCM)
        let pushResult = null;
        if (effectiveUserId) {
            pushResult = await pushNotificationService.sendToUser(
                effectiveUserId,
                alertTitle,
                alertBody,
                {
                    type: "CITIZEN_UNSAFE_ALARM",
                    siren: "true",
                    sound: "siren",
                    triggerSiren: "true",
                    shelterName: String(nearestShelter.name),
                    shelterAddress: String(nearestShelter.address || ""),
                    shelterPhone: String(nearestShelter.contactNumber || "112"),
                    mapUrl: mapsUrl,
                    distanceKm: String(distKm),
                    latitude: String(sLat),
                    longitude: String(sLng),
                    url: mapsUrl,
                }
            );
        }

        // 5. Send SMS alert to phone number
        let smsResult = null;
        if (recipientPhone) {
            const smsText = `🚨 DANGER ALERT: Evacuate immediately! Nearest safe place: ${nearestShelter.name}, ${nearestShelter.address}. Map route: ${mapsUrl}. Call 112 for emergency help.`;
            smsResult = await sendSMS(recipientPhone, smsText);
        }

        // 6. Emit Real-time WebSocket Siren & Alarm event
        const alarmPayload = {
            id: `alarm-${Date.now()}`,
            isUnsafe: true,
            triggerSiren: Boolean(triggerSiren),
            sirenSoundType: "wail",
            citizenName: recipientName,
            hazardType,
            dangerSeverity,
            title: alertTitle,
            message: alertBody,
            userCoordinates: { latitude: finalLat, longitude: finalLng },
            nearestSafePlace: {
                id: nearestShelter._id,
                name: nearestShelter.name,
                address: nearestShelter.address,
                phone: nearestShelter.contactNumber || "112",
                distanceKm: distKm,
                walkingMinutes: walkTimeMin,
                drivingMinutes: driveTimeMin,
                latitude: sLat,
                longitude: sLng,
                availableSpots: nearestShelter.capacity
                    ? Math.max(0, nearestShelter.capacity - (nearestShelter.currentOccupancy || 0))
                    : "Available",
            },
            mapRouteUrl: mapsUrl,
            platformRouteUrl,
            timestamp: new Date().toISOString(),
        };

        try {
            const io = getIO();
            if (effectiveUserId) {
                io.to(`user:${effectiveUserId}`).emit("citizenUnsafeAlarm", alarmPayload);
                io.to(`user:${effectiveUserId}`).emit("notification", {
                    _id: alarmPayload.id,
                    title: alertTitle,
                    message: alertBody,
                    type: "disaster_alert",
                    priority: "critical",
                    createdAt: alarmPayload.timestamp,
                    metadata: { mapUrl: mapsUrl, nearestSafePlace: alarmPayload.nearestSafePlace },
                });
            }
            // Also emit to alerts room for any nearby responders
            io.to("alerts").emit("citizenUnsafeAlarm", alarmPayload);
        } catch (socketErr) {
            console.warn("[EvacuationController] Socket broadcast warning:", socketErr.message);
        }

        // 7. Store notification record in MongoDB
        let savedNotification = null;
        try {
            savedNotification = await Notification.create({
                recipient: effectiveUserId || null,
                isBroadcast: !effectiveUserId,
                title: alertTitle,
                message: alertBody,
                type: "disaster_alert",
                priority: "critical",
                status: pushResult?.success ? "sent" : "partial",
                channels: ["in-app", "push", "sms"],
                metadata: {
                    sirenTriggered: true,
                    nearestSafePlace: alarmPayload.nearestSafePlace,
                    mapRouteUrl: mapsUrl,
                    hazardType,
                },
            });
        } catch (notifErr) {
            console.warn("[EvacuationController] Notification save warning:", notifErr.message);
        }

        res.status(200).json({
            success: true,
            message: "Citizen unsafe emergency alert, phone siren, and safe route dispatched successfully",
            data: {
                alarm: alarmPayload,
                delivery: {
                    push: pushResult,
                    sms: smsResult,
                    notificationId: savedNotification?._id,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/evacuation/broadcast-unsafe-citizens
 * Operator broadcast that alerts all citizens in danger zones or marked unsafe
 */
const broadcastToUnsafeCitizens = async (req, res, next) => {
    try {
        const {
            hazardType = "Emergency Hazard",
            dangerZoneName = "Active Hazard Perimeter",
            affectedCoordinates,
            customMessage,
        } = req.body;

        // Fetch active shelters
        const shelters = await Shelter.find({ status: { $ne: "closed" } }).lean();
        const primaryShelter = shelters[0] || {
            name: "District Emergency Safe Refuge",
            address: "Central Relief Center, Highway Junction",
            contactNumber: "112",
            location: { coordinates: [85.8312, 20.3015] },
        };

        const sLat = primaryShelter.location?.coordinates?.[1] || 20.3015;
        const sLng = primaryShelter.location?.coordinates?.[0] || 85.8312;
        const defaultMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${sLat},${sLng}&travelmode=walking`;

        const broadcastPayload = {
            id: `broadcast-alarm-${Date.now()}`,
            isUnsafe: true,
            triggerSiren: true,
            sirenSoundType: "wail",
            citizenName: "All Citizens in Hazard Area",
            hazardType,
            dangerSeverity: "critical",
            title: `🚨 EMERGENCY EVACUATION ORDER: ${hazardType.toUpperCase()}!`,
            message: customMessage || `🚨 DANGER ALERT: All residents in ${dangerZoneName} are instructed to evacuate immediately to ${primaryShelter.name}. Follow map navigation route now.`,
            nearestSafePlace: {
                id: primaryShelter._id,
                name: primaryShelter.name,
                address: primaryShelter.address,
                phone: primaryShelter.contactNumber || "112",
                latitude: sLat,
                longitude: sLng,
            },
            mapRouteUrl: defaultMapsUrl,
            platformRouteUrl: "/evacuation-planner",
            timestamp: new Date().toISOString(),
        };

        try {
            const io = getIO();
            io.to("alerts").emit("citizenUnsafeAlarm", broadcastPayload);
            io.emit("citizenUnsafeAlarm", broadcastPayload);
        } catch (err) {
            console.warn("[EvacuationController] Socket broadcast error:", err.message);
        }

        // Save broadcast notification
        await Notification.create({
            isBroadcast: true,
            title: broadcastPayload.title,
            message: broadcastPayload.message,
            type: "disaster_alert",
            priority: "critical",
            status: "sent",
            channels: ["in-app", "push"],
            metadata: {
                sirenTriggered: true,
                nearestSafePlace: broadcastPayload.nearestSafePlace,
                mapRouteUrl: defaultMapsUrl,
            },
        });

        res.status(200).json({
            success: true,
            message: "Emergency danger siren and safe shelter routing broadcasted to all citizens in danger zone",
            data: broadcastPayload,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateEvacuationPlan,
    triggerCitizenUnsafeAlert,
    broadcastToUnsafeCitizens,
};