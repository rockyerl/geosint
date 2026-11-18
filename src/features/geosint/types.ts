export type Role = "pimpinan" | "analis" | "operator";

export type EventStatus = "pending_review" | "follow_up_required" | "resolved";

export type EventKind = "flood" | "hotspot" | "land_change";

export type SourceKind = "radar" | "optical" | "hotspot" | "metadata" | "internal";

export type EvidenceKind = "scene" | "indicator" | "field_report" | "field_confirmation";

export type AuditAction = "review" | "publish_brief" | "import_batch" | "reset";

export type SourceFreshness = "ready" | "delayed" | "unavailable";

export type Point = [number, number];

export interface Area {
  id: string;
  name: string;
  areaKm2: number;
  outline: Point[];
}

export interface Source {
  id: string;
  label: string;
  kinds: SourceKind[];
  lastSuccessfulImportAt: string | null;
  freshForHours: number;
}

export interface Scene {
  id: string;
  aoiId: string;
  sourceId: string;
  sensor: string;
  capturedAt: string;
  cloudPercent: number | null;
  assetPath: string;
}

export interface GeoEvent {
  id: string;
  aoiId: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  evidenceIds: string[];
}

export interface Evidence {
  id: string;
  eventId: string;
  sourceId: string;
  kind: EvidenceKind;
  observedAt: string;
  label: string;
  sceneId?: string;
}

export interface TimeWindow {
  from: string;
  to: string;
}

export interface Topic {
  id: string;
  label: string;
}

export interface NarrativeItem {
  id: string;
  sourceId: string;
  title: string;
  topicId: string;
  publishedAt: string;
  mentionedAoiId: string | null;
  publishedAoiId: string | null;
  // UI helper fields
  headline?: string;
  snippet?: string;
  sourceChannel?: string;
  mentionedLocation?: string;
  authorLocation?: string | null;
  authorAccount?: string;
}

export interface AccountAggregate {
  aoiId: string;
  window: TimeWindow;
  distinctAccounts: number;
  locationCoverage: "available" | "missing";
}

export interface CorrelationFinding {
  eventId: string;
  aoiId: string;
  window: TimeWindow;
  topicId: string;
  basis: "same_area_and_time";
  status: "candidate" | "insufficient_evidence";
  evidenceIds: string[];
  narrativeItemIds: string[];
  missingSources: string[];
}

export interface Review {
  id: string;
  eventId: string;
  actorId: string;
  note: string;
  evidenceIds: string[];
  toStatus: EventStatus;
  createdAt: string;
}

export interface BriefingSnapshot {
  title: string;
  status: EventStatus;
  observedAt: string;
  findings: string;
  limitations: string;
  nextAction: string;
  evidenceIds: string[];
  aoiId?: string;
  window?: TimeWindow;
  narrativeItemIds?: string[];
  topicId?: string;
  narrativeTheme?: string;
  correlatedSourcesCount?: number;
}

export interface Briefing {
  id: string;
  eventId: string;
  version: number;
  approvedBy: string;
  approvedAt: string;
  snapshot: BriefingSnapshot;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  role: Role;
  action: AuditAction;
  targetId: string;
  details: string;
  success: boolean;
}

export interface BatchLog {
  batchId: string;
  timestamp: string;
  status: "success" | "duplicate" | "failed";
  itemCount: number;
  acceptedCount: number;
  duplicateCount: number;
  failedCount: number;
  reason?: string;
}

/** Batch import payload (operator). Validated by GeosintRepository.simulateImport. */
export interface ImportDraft {
  batchId: string;
  aoiId?: string;
  evidence?: Evidence;
}

/** A demo batch that carries one evidence item. */
export interface EvidenceImport {
  batchId: string;
  evidence: Evidence;
}

export interface DemoActions {
  arunaFloodOutline: Point[];
  validImport: EvidenceImport;
  sagaraImport: EvidenceImport;
  invalidImport: {
    batchId: string;
    aoiId: string;
  };
}

export interface NarrativeTrendPoint {
  time: string;
  count: number;
}

export interface NarrativeCluster {
  id: string;
  theme: string;
  sourceId: string;
  targetAoiId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  totalContent: number;
  uniqueAccountsCount: number; // Ambang batas RAB: minimum 10 akun per wilayah/periode
  hasSufficientGeoMetadata: boolean;
  volumeTrend: NarrativeTrendPoint[];
  items: NarrativeItem[];
}

export interface MultiSourceCorrelation {
  id: string;
  eventId: string;
  aoiId: string;
  title: string;
  timeWindow: string; // misal "Rentang 48 Jam"
  status: "verified" | "investigating" | "data_insufficient";
  rationale: string; // Dasar keterkaitan wilayah-waktu
  satelliteEvidenceId: string;
  fieldReportEvidenceId: string;
  narrativeClusterId: string;
  hasSufficientGeoData: boolean;
  limitationNote?: string;
}

export interface CorrelationTrendBucket {
  bucketIndex: number;
  from: string;
  to: string;
  count: number;
  label: string;
}

export interface CorrelationWorkspaceData {
  aoi: Area;
  window: TimeWindow;
  topic: Topic | null;
  eventsInPeriod: GeoEvent[];
  scenesInPeriod: Scene[];
  historicalReferenceScenes: Scene[];
  sources: Source[];
  narrativeTrendBuckets: CorrelationTrendBucket[];
  narrativeItemsInWindow: NarrativeItem[];
  unlocatedNarrativeItems: NarrativeItem[];
  candidateCorrelations: CorrelationFinding[];
  accountAggregate?: AccountAggregate;
  accountAggregateStatus: "below_threshold" | "valid" | "not_available";
}

export interface DemoPreset {
  aoiId: string;
  topicId: string;
  window: TimeWindow;
}

export interface DemoState {
  fixtureVersion: number;
  demoNow: string;
  areas: Area[];
  sources: Source[];
  scenes: Scene[];
  events: GeoEvent[];
  evidence: Evidence[];
  topics: Topic[];
  narrativeItems: NarrativeItem[];
  optionalAccountAggregates: AccountAggregate[];
  demoPreset: DemoPreset;
  narrativeClusters: NarrativeCluster[];
  correlations: MultiSourceCorrelation[];
  demoActions: DemoActions;
  reviews: Review[];
  briefings: Briefing[];
  audits: AuditEntry[];
  batchLogs: BatchLog[];
  processedBatchIds: string[];
}

export interface EventFilter {
  aoiId?: string;
  kind?: EventKind | "all";
  status?: EventStatus | "all";
  from?: string;
  to?: string;
  search?: string;
  timeWindowHours?: number; // Filter rentang waktu bersama (e.g. 48 jam)
}

export interface EventSummaryProjection {
  id: string;
  aoiId: string;
  areaName: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  evidenceCount: number;
  latestApprovedBriefing?: Briefing;
  hasCorrelatedNarrative?: boolean;
}

export interface PimpinanEventDetail {
  id: string;
  aoiId: string;
  areaName: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  area: Area;
  latestApprovedBriefing?: Briefing;
  isBriefingStale: boolean;
  briefingsCount: number;
  correlations: MultiSourceCorrelation[];
  narrativeSummary?: string;
}

export interface AnalystEventDetail {
  event: GeoEvent;
  area: Area;
  evidence: Evidence[];
  scenes: Scene[];
  reviews: Review[];
  briefings: Briefing[];
  latestApprovedBriefing?: Briefing;
  isBriefingStale: boolean;
  correlations: Evidence[];
  multiSourceCorrelations: MultiSourceCorrelation[];
  narrativeClusters: NarrativeCluster[];
  draftSummary: { findings: string; limitations: string; nextAction: string };
}
