import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { ROUTES } from '../../../constants/routes';
import { openWebFeature } from '../../../utils/webPortal';

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  route?: string;
  webPath?: string;
  badge?: string;
  badgeColor?: string;
}

const ALL_FEATURES: FeatureItem[] = [
  // ── 1. Immediate Crisis Response
  {
    id: 'sos',
    title: 'Emergency SOS Center',
    subtitle: '1-Tap GPS Distress Broadcast & Audio Siren',
    category: 'Crisis',
    icon: '🆘',
    route: ROUTES.MAIN.EMERGENCY.SOS,
    badge: 'SOS',
    badgeColor: COLORS.emergency,
  },
  {
    id: 'live-map',
    title: 'Live Situation Map',
    subtitle: 'Real-time hazard zones, rescue teams & incidents',
    category: 'Crisis',
    icon: '🗺️',
    route: ROUTES.MAIN.MAPS.LIVE,
    badge: 'TACTICAL',
    badgeColor: COLORS.primary,
  },
  {
    id: 'alerts',
    title: 'Disaster Early Warnings',
    subtitle: 'IMD, NDMA & CWC official critical broadcast feeds',
    category: 'Crisis',
    icon: '🚨',
    route: ROUTES.MAIN.EMERGENCY.ALERTS,
    badge: 'CRITICAL',
    badgeColor: COLORS.emergency,
  },
  {
    id: 'evac-router',
    title: 'Evacuation Route Planner',
    subtitle: 'Turn-by-turn safe navigation away from disaster zones',
    category: 'Crisis',
    icon: '🧭',
    route: ROUTES.MAIN.RISK.EVACUATION,
    badge: 'ROUTES',
    badgeColor: COLORS.primary,
  },
  {
    id: 'shelters',
    title: 'Emergency Shelters & Havens',
    subtitle: 'Verified safe camps, bed occupancy & relief supplies',
    category: 'Crisis',
    icon: '🏕️',
    route: ROUTES.MAIN.SAFETY.SHELTERS,
    badge: 'HAVENS',
    badgeColor: COLORS.success,
  },
  {
    id: 'damage',
    title: 'Rapid Damage Assessment',
    subtitle: 'Categorized structural damage triage & resource survey',
    category: 'Crisis',
    icon: '🏚️',
    route: ROUTES.MAIN.FEATURES.DAMAGE_ASSESSMENT,
    badge: 'SURVEY',
    badgeColor: COLORS.warning,
  },
  {
    id: 'relief-fleet',
    title: 'Live Relief Fleet Tracker',
    subtitle: 'GPS tracking of medical vans, food convoys & air drops',
    category: 'Crisis',
    icon: '🚚',
    route: ROUTES.MAIN.FEATURES.RELIEF_TRACKER,
    badge: 'GPS',
    badgeColor: COLORS.info,
  },
  {
    id: 'dynamic-evac',
    title: 'Anti-Herd Dynamic Evacuation',
    subtitle: 'Congestion-free distributed route load balancing',
    category: 'Crisis',
    icon: '🏃',
    route: ROUTES.MAIN.FEATURES.DYNAMIC_EVACUATION,
    badge: 'AI-ROUTE',
    badgeColor: COLORS.primary,
  },
  {
    id: 'safe-zones',
    title: 'Autonomous Safe Zone Tracker',
    subtitle: 'Real-time geotechnical safe perimeter tracking',
    category: 'Crisis',
    icon: '🛡️',
    route: ROUTES.MAIN.RISK.SAFE_ZONES,
    badge: 'SAFE',
    badgeColor: COLORS.success,
  },

  // ── 2. Intelligence & Telemetry
  {
    id: 'ai-chat',
    title: 'AI Emergency Copilot',
    subtitle: 'Conversational disaster advisor & tactical assistant',
    category: 'Intel',
    icon: '🤖',
    route: ROUTES.MAIN.AI.CHAT,
    badge: 'AI BRAIN',
    badgeColor: '#A855F7',
  },
  {
    id: 'ai-voice',
    title: 'Hands-Free Voice Assistant',
    subtitle: 'Voice-controlled emergency triage and guidance',
    category: 'Intel',
    icon: '🎙️',
    route: ROUTES.MAIN.AI.VOICE,
    badge: 'VOICE',
    badgeColor: '#A855F7',
  },
  {
    id: 'ner-landslide',
    title: 'NER Landslide Telemetry Monitor',
    subtitle: 'Slope pore-pressure radar & InSAR telemetry',
    category: 'Intel',
    icon: '⛰️',
    route: ROUTES.MAIN.FEATURES.NER_LANDSLIDE,
    badge: 'RADAR',
    badgeColor: '#F97316',
  },
  {
    id: 'statistics',
    title: 'Statistics & Impact Analytics',
    subtitle: 'Casualty trends, rescue velocity & relief KPIs',
    category: 'Intel',
    icon: '📊',
    route: ROUTES.MAIN.FEATURES.STATISTICS,
    badge: 'METRICS',
    badgeColor: COLORS.primary,
  },
  {
    id: 'climate-chronicle',
    title: 'Climate Disaster Intelligence',
    subtitle: 'Multi-decadal historical disaster trends & cycles',
    category: 'Intel',
    icon: '🌍',
    route: ROUTES.MAIN.FEATURES.CLIMATE_CHRONICLE,
    badge: 'CLIMATE',
    badgeColor: '#0EA5E9',
  },
  {
    id: 'geotech-risk',
    title: 'Geotechnical Hazard Risk',
    subtitle: 'Deep neural hazard prognosis for hillside slopes',
    category: 'Intel',
    icon: '⚠️',
    route: ROUTES.MAIN.RISK.CURRENT,
    badge: 'GEOTECH',
    badgeColor: '#F59E0B',
  },

  // ── 3. Connectivity & Off-Grid Mesh
  {
    id: 'smart-alerts',
    title: 'Smart IoT Multi-Sensory Alert Grid',
    subtitle: 'River water sensors, seismic acoustic tripwires',
    category: 'Mesh',
    icon: '📡',
    route: ROUTES.MAIN.FEATURES.SMART_ALERTS,
    badge: 'IoT',
    badgeColor: '#06B6D4',
  },
  {
    id: 'mesh-console',
    title: 'LoRa Mesh Network Console',
    subtitle: 'Hardware packet telemetry & multi-hop routing',
    category: 'Mesh',
    icon: '📻',
    route: ROUTES.MAIN.FEATURES.MESH_CONSOLE,
    badge: 'P2P',
    badgeColor: COLORS.success,
  },
  {
    id: 'zero-internet',
    title: 'Zero-Internet P2P Mesh Mode',
    subtitle: 'Local device-to-device offline emergency message relay',
    category: 'Mesh',
    icon: '📴',
    route: ROUTES.MAIN.FEATURES.ZERO_INTERNET,
    badge: 'OFF-GRID',
    badgeColor: COLORS.warning,
  },
  {
    id: 'low-bandwidth',
    title: 'Ultra-Low 2G Bandwidth Mode',
    subtitle: 'Raw text portal optimized for minimal 2G connectivity',
    category: 'Mesh',
    icon: '⚡',
    route: ROUTES.MAIN.FEATURES.LOW_BANDWIDTH,
    badge: '2G MODE',
    badgeColor: '#64748B',
  },
  {
    id: 'offline-sync',
    title: 'Offline Storage & Sync Status',
    subtitle: 'Local SQLite database queue and pending uploads',
    category: 'Mesh',
    icon: '💾',
    route: ROUTES.MAIN.OFFLINE.STATUS,
    badge: 'SQLITE',
    badgeColor: COLORS.success,
  },

  // ── 4. Field Deployments & Logistics
  {
    id: 'drone-analytics',
    title: 'Drone Video AI Reconnaissance',
    subtitle: 'UAV aerial survivor detection & damage inspection',
    category: 'Field',
    icon: '🚁',
    route: ROUTES.MAIN.FEATURES.DRONE_ANALYTICS,
    badge: 'UAV',
    badgeColor: COLORS.primary,
  },
  {
    id: 'volunteer-tasks',
    title: 'Volunteer Micro-Tasking Network',
    subtitle: 'Crowdsourced field tasks, medical & food distribution',
    category: 'Field',
    icon: '🤝',
    route: ROUTES.MAIN.FEATURES.VOLUNTEER_TASKS,
    badge: 'VOLUNTEER',
    badgeColor: COLORS.success,
  },
  {
    id: 'aid-ledger',
    title: 'Aid Distribution Blockchain Ledger',
    subtitle: 'Auditable cryptographic ledger of emergency supplies',
    category: 'Field',
    icon: '📦',
    route: ROUTES.MAIN.FEATURES.AID_LEDGER,
    badge: 'LEDGER',
    badgeColor: '#06B6D4',
  },
  {
    id: 'reconstruction',
    title: 'Community Reconstruction Map',
    subtitle: 'Post-disaster rebuilding monitoring & infrastructure repair',
    category: 'Field',
    icon: '🏗️',
    route: ROUTES.MAIN.FEATURES.RECONSTRUCTION,
    badge: 'REBUILD',
    badgeColor: COLORS.warning,
  },

  // ── 5. Citizen & Community Safety
  {
    id: 'family-safety',
    title: 'Family Safety & Circles',
    subtitle: 'Live safety check-ins, battery levels & distress alerts',
    category: 'Safety',
    icon: '👨‍👩‍👧',
    route: ROUTES.MAIN.SAFETY.FAMILY,
    badge: 'FAMILY',
    badgeColor: '#818CF8',
  },
  {
    id: 'qr-rescue-id',
    title: 'Digital QR Rescue ID',
    subtitle: 'Instant offline medical profile & emergency responder card',
    category: 'Safety',
    icon: '🪪',
    route: ROUTES.MAIN.SAFETY.FAMILY_MEMBER,
    badge: 'QR ID',
    badgeColor: '#818CF8',
  },
  {
    id: 'report-incident',
    title: 'Report Citizen Incident',
    subtitle: 'Submit field photos, hazard type and GPS coordinates',
    category: 'Safety',
    icon: '📸',
    route: ROUTES.MAIN.INCIDENTS.REPORT,
    badge: 'CITIZEN',
    badgeColor: COLORS.emergency,
  },
  {
    id: 'my-reports',
    title: 'My Incident Reports',
    subtitle: 'Track status of verified disaster reports and triage',
    category: 'Safety',
    icon: '📋',
    route: ROUTES.MAIN.INCIDENTS.MY_REPORTS,
    badge: 'MY STATUS',
    badgeColor: COLORS.warning,
  },
  {
    id: 'safety-guides',
    title: 'Standard Safety Action Guides',
    subtitle: 'Official SOP survival checklists for floods, quakes & storms',
    category: 'Safety',
    icon: '📖',
    route: ROUTES.MAIN.SAFETY.GUIDE,
    badge: 'SOP',
    badgeColor: COLORS.success,
  },
  {
    id: 'first-aid',
    title: 'Life-Saving First Aid Protocols',
    subtitle: 'Step-by-step trauma stabilization and CPR manuals',
    category: 'Safety',
    icon: '🩺',
    route: ROUTES.MAIN.SAFETY.FIRST_AID,
    badge: 'FIRST AID',
    badgeColor: COLORS.emergency,
  },
  {
    id: 'emergency-contacts',
    title: 'Emergency Helplines & Numbers',
    subtitle: 'Direct dial to NDRF, SDRF, Ambulance, Police & Fire',
    category: 'Safety',
    icon: '📞',
    route: ROUTES.MAIN.EMERGENCY.CONTACTS,
    badge: 'HOTLINES',
    badgeColor: COLORS.primary,
  },

  // ── 6. Innovation Lab & Deep-Tech
  {
    id: 'digital-twin',
    title: 'AI Digital Twin 3D Simulation',
    subtitle: 'Physics-based predictive disaster propagation simulator',
    category: 'Innovation',
    icon: '🏙️',
    route: ROUTES.MAIN.FEATURES.DIGITAL_TWIN,
    badge: '3D SIM',
    badgeColor: '#A855F7',
  },
  {
    id: 'ner-topography',
    title: 'Multi-Disaster Simulation Suite',
    subtitle: 'Terrain contour flood runoff & landslide simulation',
    category: 'Innovation',
    icon: '🏔️',
    route: ROUTES.MAIN.FEATURES.NER_TOPOGRAPHY,
    badge: 'NER SUITE',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'world-first',
    title: 'World-First Deep-Tech Suite',
    subtitle: 'Magnetometer, Muon, Infrasonic & Quantum Chaff',
    category: 'Innovation',
    icon: '🔬',
    route: ROUTES.MAIN.FEATURES.WORLD_FIRST,
    badge: 'NOVEL TECH',
    badgeColor: '#6366F1',
  },
  {
    id: 'decentralized-res',
    title: 'Decentralized SAR Radar Grid',
    subtitle: 'Ultrasonic mesh relay, radio triangulation & IPFS mirrors',
    category: 'Innovation',
    icon: '📡',
    route: ROUTES.MAIN.FEATURES.DECENTRALIZED_RESILIENCE,
    badge: 'SAR RADAR',
    badgeColor: '#EC4899',
  },
  {
    id: 'extreme-res',
    title: 'Extreme Resilience Grid',
    subtitle: 'WASM edge supercomputing, E-Ink canvas & LiFi receivers',
    category: 'Innovation',
    icon: '🧪',
    route: ROUTES.MAIN.FEATURES.EXTREME_RESILIENCE,
    badge: 'EXTREME',
    badgeColor: '#06B6D4',
  },
  {
    id: 'ar-risk',
    title: 'AR See The Risk Scanner',
    subtitle: 'Camera augmented reality slope elevation scanner',
    category: 'Innovation',
    icon: '👓',
    route: ROUTES.MAIN.FEATURES.AR_RISK,
    badge: 'AR SCAN',
    badgeColor: '#14B8A6',
  },

  // ── 7. System, Protocols & Support
  {
    id: 'faq',
    title: 'Help, SOP Protocols & FAQ',
    subtitle: 'Crisis SOP guidelines, operating standards & help center',
    category: 'System',
    icon: '❓',
    route: ROUTES.MAIN.FEATURES.FAQ,
    badge: 'SUPPORT',
    badgeColor: '#64748B',
  },
  {
    id: 'reviews',
    title: 'Operational Community Feedback',
    subtitle: 'Field reliability reviews and feedback reports',
    category: 'System',
    icon: '⭐',
    route: ROUTES.MAIN.FEATURES.REVIEWS,
    badge: 'FEEDBACK',
    badgeColor: '#64748B',
  },
  {
    id: 'profile',
    title: 'Responder Profile & Credentials',
    subtitle: 'Verified credentials, responder ID & identity',
    category: 'System',
    icon: '👤',
    route: ROUTES.MAIN.PROFILE.DETAILS,
    badge: 'PROFILE',
    badgeColor: COLORS.primary,
  },
  {
    id: 'settings',
    title: 'Platform Settings & Hardware',
    subtitle: 'Sensor calibration, language & notification controls',
    category: 'System',
    icon: '⚙️',
    route: ROUTES.MAIN.PROFILE.SETTINGS,
    badge: 'SETTINGS',
    badgeColor: '#64748B',
  },
];

const CATEGORIES = ['All', 'Crisis', 'Intel', 'Mesh', 'Field', 'Safety', 'Innovation', 'System'];

export default function FeaturesIndexScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFeatures = ALL_FEATURES.filter((f) => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunch = (feature: FeatureItem) => {
    if (feature.route) {
      router.push(feature.route as any);
    } else if (feature.webPath) {
      openWebFeature(feature.webPath);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="All Platform Features" showBack />
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search all 35+ features..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {cat === 'All' ? `All (${ALL_FEATURES.length})` : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.countBanner}>
          SHOWING {filteredFeatures.length} TACTICAL MODULES
        </Text>

        {filteredFeatures.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.featureCard}
            onPress={() => handleLaunch(item)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.featureIcon}>{item.icon}</Text>
              </View>
              <View style={styles.cardTextCol}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  {item.badge && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(56,189,248,0.15)' },
                        { borderColor: item.badgeColor || COLORS.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: item.badgeColor || COLORS.primary },
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Web Launch Banner */}
        <TouchableOpacity
          style={styles.webBanner}
          onPress={() => openWebFeature('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.webBannerIcon}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.webBannerTitle}>Full Desktop Command Console</Text>
            <Text style={styles.webBannerSub}>
              Launch the full web edition in your browser for large-screen 3D simulations
            </Text>
          </View>
          <Text style={styles.webBannerBtn}>OPEN ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    height: 42,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    color: COLORS.textMuted,
    fontSize: 16,
    paddingHorizontal: 6,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  catPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  countBanner: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureIcon: {
    fontSize: 22,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 4,
    marginBottom: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  featureSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 22,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  webBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  webBannerIcon: {
    fontSize: 26,
  },
  webBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  webBannerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  webBannerBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
