import React, { useState } from "react";
import { Alert } from "react-native";
import { Button, Screen, StepHeader } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { RegistrationData } from "@/types/registration";
import type { ScreenProps } from "@/navigation/types";
import { STEPS } from "./steps";

export default function RegistrationScreen({ navigation }: ScreenProps<"Registration">) {
  const { registration, updateRegistration, submitApplication, loading } = useAuth();
  const [index, setIndex] = useState(0);
  const step = STEPS[index]!;
  const isLast = index === STEPS.length - 1;
  const canContinue = step.valid(registration);

  const pick = (field: keyof RegistrationData, name: string) => {
    // Wire to expo-image-picker / expo-document-picker here.
    updateRegistration({ [field]: { name, size: "1.8 MB", status: "uploading" } } as Partial<RegistrationData>);
    setTimeout(
      () =>
        updateRegistration({
          [field]: { name, size: "1.8 MB", status: "uploaded", uploadedAt: new Date().toISOString() },
        } as Partial<RegistrationData>),
      900,
    );
  };

  const back = () => (index === 0 ? navigation.goBack() : setIndex((i) => i - 1));

  const next = async () => {
    if (!isLast) return setIndex((i) => i + 1);
    try {
      await submitApplication();
    } catch {
      Alert.alert("Submission failed", "Check your connection and try again.");
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={isLast ? "Submit application" : "Continue"}
          onPress={next}
          disabled={!canContinue}
          loading={loading}
        />
      }
    >
      <StepHeader
        step={index + 1}
        total={STEPS.length}
        title={step.title}
        subtitle={step.subtitle}
        onBack={back}
        onExit={() => navigation.goBack()}
      />
      {step.render({ data: registration, set: updateRegistration, pick })}
    </Screen>
  );
}
