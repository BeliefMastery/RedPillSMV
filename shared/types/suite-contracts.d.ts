/**
 * Shared TypeScript contracts for the Red-Pill Relational Suite.
 * Covers assessment snapshots, multi-slider value allocations, and cross-suite calibration.
 */

export type RespondentGender = 'male' | 'female';

export interface ValueAllocationAnswer {
  type: 'value_allocation';
  allocationPercents?: number[];
  allocationTotal?: number;
  weights?: Record<string, number>;
  sum?: number;
}

export interface AllocationMember {
  id: string;
  label: string;
  weight?: number;
}

export interface AllocationQuestion {
  id: string;
  text: string;
  plainHint?: string;
  type: 'value_allocation';
  allocationMembers: AllocationMember[];
  allocationWeights: Record<string, number>;
  allocationTargetSum?: number;
}

export interface ArchetypeNode {
  id: string;
  name: string;
  socialRole?: string;
  parentType?: string;
  isShadow?: boolean;
  weighted?: number;
}

export interface ArchetypeResult {
  gender?: RespondentGender;
  analysisData: {
    primaryArchetype: ArchetypeNode;
    secondaryArchetype?: ArchetypeNode;
    tertiaryArchetype?: ArchetypeNode;
    gender?: RespondentGender;
  };
}

export interface PolarityResult {
  gender?: RespondentGender;
  analysisData: {
    gender?: RespondentGender;
    overallTemperament: {
      normalizedScore: number; // 0.0 (highly feminine/receptive) to 1.0 (highly masculine/directive)
      category:
        | 'highly_masculine'
        | 'predominantly_masculine'
        | 'balanced_masculine'
        | 'balanced'
        | 'balanced_feminine'
        | 'predominantly_feminine'
        | 'highly_feminine';
    };
    crossPolarity?: boolean;
  };
}

export interface SMVClusters {
  coalitionRank: number;
  reproductiveConfidence: number;
  axisOfAttraction: number;
}

export interface SuiteCalibrationMetadata {
  applied: boolean;
  version: string;
  inputsHash?: string;
  deltas?: Partial<SMVClusters> & { overall?: number };
}

export interface SMVResult {
  currentGender: RespondentGender;
  smv: {
    overall: number; // 0..100 percentile
    clusters: SMVClusters;
    delusionIndex?: number;
    suiteCalibration?: SuiteCalibrationMetadata;
  };
}

export interface SuiteBackupPayload {
  schema: 'redpill-suite-backup:v1';
  exportedAt: string;
  data: Record<string, string>;
}
