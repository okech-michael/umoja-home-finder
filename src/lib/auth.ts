import { supabase } from "@/integrations/supabase/client";

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/admin`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }

  if (data.url) {
    window.location.assign(data.url);
  }
}
