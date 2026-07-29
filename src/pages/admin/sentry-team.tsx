import { useCallback, useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, UserPlus, Users } from "lucide-react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LoadError } from "../../components/ui/load-error";
import { Skeleton } from "../../components/ui/skeleton";
import { Slider } from "../../components/ui/slider";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { toast } from "../../hooks/use-toast";
import {
  DEFAULT_QUALIFICATION_CONFIG,
  getSentryConfig,
  inviteSentryUser,
  listSentryUsers,
  revokeSentryAccess,
  toggleOwner,
  updateSentryConfig,
  type QualificationConfig,
  type SentryTeamMember,
} from "../../lib/sentry-team";
import {
  getUserCoverageStats,
  type SentryCoverageStats,
} from "../../lib/sentry-coverage";
import { Link } from "react-router-dom";

type ConfirmAction =
  | { type: "revoke"; member: SentryTeamMember }
  | { type: "toggle-owner"; member: SentryTeamMember; next: boolean }
  | null;

export default function AdminSentryTeamPage() {
  const { user, isOwner } = useAuth();
  const [members, setMembers] = useState<SentryTeamMember[]>([]);
  const [coverageByUser, setCoverageByUser] = useState<
    Record<string, SentryCoverageStats>
  >({});
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAsOwner, setInviteAsOwner] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [acting, setActing] = useState(false);

  const [placesKey, setPlacesKey] = useState("");
  const [pagespeedKey, setPagespeedKey] = useState("");
  const [qualification, setQualification] = useState<QualificationConfig>(
    DEFAULT_QUALIFICATION_CONFIG,
  );
  const [savingConfig, setSavingConfig] = useState(false);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const [team, config] = await Promise.all([listSentryUsers(), getSentryConfig()]);
    if (ctl.isCancelled()) return;
    setMembers(team);
    setPlacesKey(config.google_places_api_key ?? "");
    setPagespeedKey(config.pagespeed_api_key ?? "");
    setQualification(config.qualification_config);

    const coverageEntries = await Promise.all(
      team.map(async (member) => {
        try {
          const stats = await getUserCoverageStats(member.id);
          return [member.id, stats] as const;
        } catch {
          return null;
        }
      }),
    );
    if (ctl.isCancelled()) return;
    const next: Record<string, SentryCoverageStats> = {};
    for (const entry of coverageEntries) {
      if (entry) next[entry[0]] = entry[1];
    }
    setCoverageByUser(next);
  }, []);

  const { loading, error, retry } = useCancellableLoad(load);

  const submitInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    try {
      const result = await inviteSentryUser({
        email,
        isOwner: inviteAsOwner,
      });
      toast({
        title: result.wasExisting ? "Existing user updated" : "Invite sent",
        description: result.wasExisting
          ? `${email} now has Sentry access.`
          : `A magic-link invite was sent to ${email}.`,
      });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteAsOwner(false);
      retry();
    } catch (err) {
      toast({
        title: "Invite failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setActing(true);
    try {
      if (confirm.type === "revoke") {
        await revokeSentryAccess(confirm.member.id);
        toast({
          title: "Sentry access revoked",
          description: `${confirm.member.email} can no longer run Sentry.`,
        });
      } else {
        await toggleOwner(confirm.member.id, confirm.next);
        toast({
          title: confirm.next ? "Owner granted" : "Owner removed",
          description: confirm.member.email,
        });
      }
      setConfirm(null);
      retry();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActing(false);
    }
  };

  const saveConfig = async () => {
    if (!user) return;
    if (qualification.minOverallScore > qualification.maxOverallScore) {
      toast({
        title: "Invalid thresholds",
        description: "Minimum score must be less than or equal to maximum score.",
        variant: "destructive",
      });
      return;
    }

    setSavingConfig(true);
    try {
      await updateSentryConfig(
        {
          google_places_api_key: placesKey.trim() || null,
          pagespeed_api_key: pagespeedKey.trim() || null,
          qualification_config: qualification,
        },
        user.id,
      );
      toast({
        title: "Configuration saved",
        description: "Sentry desktop clients will pick this up on next config fetch.",
      });
      retry();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <AdminLayout title="Sentry team">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Manage who can run Sentry to discover and audit leads
        </p>
        <Button onClick={() => setInviteOpen(true)} className="shrink-0">
          <UserPlus className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Invite user
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Team members</h2>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <LoadError message={error} onRetry={retry} />
        ) : members.length === 0 ? (
          <Card>
            <EmptyState icon={Users} message="No Sentry team members yet." />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Roles</th>
                    <th className="px-3 py-2 font-medium">Active claim</th>
                    <th className="px-3 py-2 font-medium">Cells (mo)</th>
                    <th className="px-3 py-2 font-medium">Discoveries (mo)</th>
                    <th className="px-3 py-2 font-medium">Audits (mo)</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => {
                    const coverage = coverageByUser[member.id];
                    const claimLabel = coverage?.activeClaim
                      ? coverage.recentClaims.find(
                          (c) => c.id === coverage.activeClaim?.id,
                        )?.lad_name || coverage.activeClaim.lad_code
                      : "None";
                    return (
                    <tr key={member.id}>
                      <td className="px-3 py-2.5 font-medium">
                        {member.full_name || "Not set"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {member.email}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {member.is_owner && (
                            <Badge variant="secondary">Owner</Badge>
                          )}
                          {member.is_sentry_user && (
                            <Badge variant="outline">Sentry user</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {claimLabel}
                      </td>
                      <td className="px-3 py-2.5">
                        {coverage?.cellsSweptThisMonth ?? "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {coverage?.discoveriesThisMonth ?? "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {coverage?.auditsThisMonth ?? "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${member.email}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/coverage`}>
                                View coverage map
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirm({ type: "revoke", member })
                              }
                              disabled={!member.is_sentry_user}
                            >
                              Revoke Sentry access
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirm({
                                  type: "toggle-owner",
                                  member,
                                  next: !member.is_owner,
                                })
                              }
                            >
                              {member.is_owner ? "Remove owner" : "Make owner"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          Recent claims by member
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => {
            const claims = coverageByUser[member.id]?.recentClaims || [];
            return (
              <Card key={`claims-${member.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {member.full_name || member.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {claims.length === 0 ? (
                    <p>No claims yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {claims.map((claim) => (
                        <li key={claim.id}>
                          {claim.lad_name || claim.lad_code} ·{" "}
                          {format(new Date(claim.claimed_at), "PP")}
                          {claim.released_at
                            ? ` · released (${claim.release_reason || "unknown"})`
                            : " · active"}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button asChild variant="link" className="mt-2 h-auto p-0">
                    <Link to="/admin/coverage">Open coverage map</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {isOwner && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            Sentry configuration
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API keys and qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="places-key">Google Places API key</Label>
                <Input
                  id="places-key"
                  type="password"
                  autoComplete="off"
                  value={placesKey}
                  onChange={(e) => setPlacesKey(e.target.value)}
                  placeholder="AIza…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagespeed-key">PageSpeed API key</Label>
                <Input
                  id="pagespeed-key"
                  type="password"
                  autoComplete="off"
                  value={pagespeedKey}
                  onChange={(e) => setPagespeedKey(e.target.value)}
                  placeholder="AIza…"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label>Minimum overall score</Label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {qualification.minOverallScore}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[qualification.minOverallScore]}
                  onValueChange={([value]) =>
                    setQualification((q) => ({ ...q, minOverallScore: value }))
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label>Maximum overall score</Label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {qualification.maxOverallScore}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[qualification.maxOverallScore]}
                  onValueChange={([value]) =>
                    setQualification((q) => ({ ...q, maxOverallScore: value }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="compliance-fail">Compliance fail qualifies</Label>
                <Switch
                  id="compliance-fail"
                  checked={qualification.complianceFailQualifies}
                  onCheckedChange={(checked) =>
                    setQualification((q) => ({
                      ...q,
                      complianceFailQualifies: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="security-fail">Security fail qualifies</Label>
                <Switch
                  id="security-fail"
                  checked={qualification.securityFailQualifies}
                  onCheckedChange={(checked) =>
                    setQualification((q) => ({
                      ...q,
                      securityFailQualifies: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="require-email">Require email</Label>
                <Switch
                  id="require-email"
                  checked={qualification.requireEmail}
                  onCheckedChange={(checked) =>
                    setQualification((q) => ({ ...q, requireEmail: checked }))
                  }
                />
              </div>

              <Button onClick={saveConfig} disabled={savingConfig}>
                {savingConfig ? "Saving…" : "Save configuration"}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              Existing Enclosure accounts are updated in place. New emails receive a
              magic-link invite for Sentry onboarding.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="grant-owner">Grant owner permissions</Label>
              <Switch
                id="grant-owner"
                checked={inviteAsOwner}
                onCheckedChange={setInviteAsOwner}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitInvite} disabled={inviting}>
              {inviting ? "Inviting…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.type === "revoke"
                ? "Revoke Sentry access"
                : confirm?.next
                  ? "Grant owner permissions"
                  : "Remove owner permissions"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.type === "revoke"
                ? `${confirm.member.email} will keep historical discoveries and audits, but cannot create new ones.`
                : confirm?.next
                  ? `${confirm?.member.email} will be able to invite team members and edit Sentry configuration.`
                  : `${confirm?.member.email} will lose owner privileges. Confirm demotion carefully.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runConfirm} disabled={acting}>
              {acting ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
