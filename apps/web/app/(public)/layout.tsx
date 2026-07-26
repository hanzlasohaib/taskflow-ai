import { AppProviders } from "@/components/providers/app-providers";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
