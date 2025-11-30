import supabase from "./supabase";
import * as Sharing from "expo-sharing";

// 👉 Use the LEGACY FS API (works on Expo SDK 54 for mobile)
import * as FileSystem from "expo-file-system/legacy";

import type { AuditLogEntry } from "@/types/api";

export const auditLogger = {
  async logAction(
    userId: string,
    action: "generate_digipin" | "validate_address" | "request_consent",
    data: {
      requestId?: string;
      digipin?: string;
      coordinates?: { latitude: number; longitude: number };
      result?: any;
    }
  ): Promise<void> {
    try {
      const logEntry = {
        user_id: userId,
        action,
        request_id: data.requestId,
        digipin: data.digipin,
        coordinates: data.coordinates,
        result: data.result,
        ip_address: null,
        created_at: new Date().toISOString(),
        metadata: {},
      };

      await supabase.from("audit_logs").insert(logEntry);
    } catch (error) {
      console.error("Failed to log audit entry:", error);
    }
  },

  async getLogsForUser(
    userId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log) => ({
        id: log.id,
        timestamp: log.created_at,
        userId: log.user_id,
        action: log.action,
        requestId: log.request_id,
        digipin: log.digipin,
        coordinates: log.coordinates,
        result: log.result,
        ipAddress: log.ip_address,
      }));
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }
  },

  async exportLogs(userId: string): Promise<void> {
    try {
      const logs = await this.getLogsForUser(userId, 1000);

      const jsonContent = JSON.stringify(logs, null, 2);
      const fileName = `aava_audit_logs_${Date.now()}.json`;

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // ✔ Works in Expo SDK 54 — UTF-8 supported
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: "utf8",
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Audit Logs",
        });
      } else {
        console.log("Sharing not available on this platform");
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
      throw error;
    }
  },
};

export default auditLogger;