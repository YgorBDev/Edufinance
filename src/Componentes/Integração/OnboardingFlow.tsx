import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { TermsDialog } from "./TermsDialog";
import { InvestorQuiz } from "./InvestorQuiz";
import { SiteTutorial } from "./SiteTutorial";

type OnboardingStep = "terms" | "quiz" | "tutorial" | "done";

function getStepFromProfile(profile: any): OnboardingStep {
  if (!profile) return "done";
  if (!profile.accepted_terms) return "terms";
  if (!profile.investor_type) return "quiz";
  if (!profile.onboarding_completed) return "tutorial";
  return "done";
}

export function OnboardingFlow() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  // Derive step directly from profile - no local override
  const derivedStep = getStepFromProfile(profile);
  // Local override to allow optimistic transitions
  const [overrideStep, setOverrideStep] = useState<OnboardingStep | null>(null);

  const step = overrideStep ?? derivedStep;

  const updateProfile = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  if (step === "done" || isLoading || !profile) return null;

  const handleAcceptTerms = async () => {
    await updateProfile.mutateAsync({ accepted_terms: true });
    setOverrideStep("quiz");
  };

  const handleQuizComplete = async (investorType: string) => {
    await updateProfile.mutateAsync({ investor_type: investorType });
    setOverrideStep("tutorial");
  };

  const handleTutorialComplete = async () => {
    await updateProfile.mutateAsync({ onboarding_completed: true });
    setOverrideStep("done");
  };

  return (
    <>
      <TermsDialog open={step === "terms"} onAccept={handleAcceptTerms} onClose={handleAcceptTerms} />
      <InvestorQuiz open={step === "quiz"} onComplete={handleQuizComplete} />
      <SiteTutorial open={step === "tutorial"} onComplete={handleTutorialComplete} />
    </>
  );
}
