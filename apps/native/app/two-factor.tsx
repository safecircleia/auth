import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { authClient } from "@/lib/auth-client";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { queryClient } from "@/utils/trpc";

export default function TwoFactorScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [isVerifying, setIsVerifying] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [activeTab, setActiveTab] = useState<"totp" | "backup">("totp");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerifyTotp() {
    if (totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: apiError } = await authClient.twoFactor.verifyTotp({
        code: totpCode,
        trustDevice,
      });

      if (apiError) {
        setError(apiError.message || "Invalid verification code");
        setTotpCode("");
      } else if (data) {
        queryClient.refetchQueries();
        router.replace("/");
      }
    } catch (err) {
      setError("Failed to verify code");
      setTotpCode("");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleVerifyBackupCode() {
    if (!backupCode.trim()) {
      setError("Please enter a backup code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: apiError } =
        await authClient.twoFactor.verifyBackupCode({
          code: backupCode.trim(),
          trustDevice,
        });

      if (apiError) {
        setError(apiError.message || "Invalid backup code");
        setBackupCode("");
      } else if (data) {
        queryClient.refetchQueries();
        router.replace("/");
      }
    } catch (err) {
      setError("Failed to verify backup code");
      setBackupCode("");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}
          >
            <Text style={[styles.iconText, { color: theme.primary }]}>🛡️</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Two-Factor Authentication
        </Text>
        <Text style={[styles.subtitle, { color: theme.text + "80" }]}>
          Enter the verification code to complete sign in
        </Text>

        {error ? (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.notification + "20" },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.notification }]}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Tab Selector */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "totp" && {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setActiveTab("totp")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "totp" ? theme.primary : theme.text + "80",
                },
              ]}
            >
              Authenticator App
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "backup" && {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setActiveTab("backup")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "backup" ? theme.primary : theme.text + "80",
                },
              ]}
            >
              Backup Code
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "totp" ? (
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.text }]}>
              Verification Code
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.codeInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder="000000"
              placeholderTextColor={theme.text + "40"}
              value={totpCode}
              onChangeText={setTotpCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={[styles.hint, { color: theme.text + "60" }]}>
              Enter the 6-digit code from your authenticator app
            </Text>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTrustDevice(!trustDevice)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: trustDevice
                      ? theme.primary
                      : "transparent",
                  },
                ]}
              >
                {trustDevice && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.text + "80" }]}>
                Trust this device for 30 days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleVerifyTotp}
              disabled={isVerifying || totpCode.length !== 6}
              style={[
                styles.button,
                {
                  backgroundColor: theme.primary,
                  opacity: isVerifying || totpCode.length !== 6 ? 0.5 : 1,
                },
              ]}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.text }]}>
              Backup Code
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder="Enter backup code"
              placeholderTextColor={theme.text + "40"}
              value={backupCode}
              onChangeText={setBackupCode}
              autoCapitalize="none"
              autoFocus
            />
            <Text style={[styles.hint, { color: theme.text + "60" }]}>
              Enter one of your backup codes. Each code can only be used once.
            </Text>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTrustDevice(!trustDevice)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: trustDevice
                      ? theme.primary
                      : "transparent",
                  },
                ]}
              >
                {trustDevice && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.text + "80" }]}>
                Trust this device for 30 days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleVerifyBackupCode}
              disabled={isVerifying || !backupCode.trim()}
              style={[
                styles.button,
                {
                  backgroundColor: theme.primary,
                  opacity: isVerifying || !backupCode.trim() ? 0.5 : 1,
                },
              ]}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Verify Backup Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text + "60" }]}>
            Lost access to your authenticator app?{" "}
          </Text>
          <TouchableOpacity onPress={() => setActiveTab("backup")}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              Use a backup code
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>
            Back to login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    fontFamily: "monospace",
  },
  hint: {
    fontSize: 12,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  button: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    alignItems: "center",
    marginTop: 16,
  },
});
