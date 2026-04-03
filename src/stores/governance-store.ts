"use client";

import { create } from "zustand";
import { DataSource, TableClassification, AccessPolicy, AccessLogEntry, TemporaryPermission, DataLevel } from "@/types/governance";
import { DUMMY_DATA_SOURCES, DUMMY_TABLE_CLASSIFICATIONS, DUMMY_ACCESS_POLICIES, DUMMY_ACCESS_LOGS, DUMMY_TEMPORARY_PERMISSIONS } from "@/dummy/governance";

interface GovernanceState {
  dataSources: DataSource[];
  tableClassifications: Record<string, TableClassification[]>;
  accessPolicies: AccessPolicy[];
  accessLogs: AccessLogEntry[];
  temporaryPermissions: TemporaryPermission[];
  classifyColumn: (dataSourceId: string, tableId: string, columnName: string, level: DataLevel) => void;
  grantTemporaryAccess: (permission: TemporaryPermission) => void;
  revokeTemporaryAccess: (permissionId: string) => void;
  addAccessLog: (entry: AccessLogEntry) => void;
}

export const useGovernanceStore = create<GovernanceState>((set) => ({
  dataSources: DUMMY_DATA_SOURCES,
  tableClassifications: DUMMY_TABLE_CLASSIFICATIONS,
  accessPolicies: DUMMY_ACCESS_POLICIES,
  accessLogs: DUMMY_ACCESS_LOGS,
  temporaryPermissions: DUMMY_TEMPORARY_PERMISSIONS,
  classifyColumn: (dataSourceId, tableId, columnName, level) =>
    set((state) => {
      const tables = [...(state.tableClassifications[dataSourceId] || [])];
      const tableIdx = tables.findIndex((t) => t.id === tableId);
      if (tableIdx >= 0 && tables[tableIdx].columns) {
        const cols = tables[tableIdx].columns!.map((c) =>
          c.name === columnName ? { ...c, classification: level, needsReview: false } : c
        );
        tables[tableIdx] = { ...tables[tableIdx], columns: cols };
      }
      return { tableClassifications: { ...state.tableClassifications, [dataSourceId]: tables } };
    }),
  grantTemporaryAccess: (permission) =>
    set((state) => ({
      temporaryPermissions: [...state.temporaryPermissions, permission],
    })),
  revokeTemporaryAccess: (permissionId) =>
    set((state) => ({
      temporaryPermissions: state.temporaryPermissions.filter((p) => p.id !== permissionId),
    })),
  addAccessLog: (entry) =>
    set((state) => ({
      accessLogs: [entry, ...state.accessLogs],
    })),
}));
