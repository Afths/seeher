import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Link, Navigate } from "react-router-dom";

type SubmissionType = Tables<"women">;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchSubmissions();
    }
  }, [user, isAdmin]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("women")
        .select("*")
        .in("status", ["PENDING_APPROVAL", "NOT_APPROVED"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: SubmissionType) => {
    try {
      // Update status to APPROVED
      const { error: updateError } = await supabase
        .from("women")
        .update({ status: "APPROVED" })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      // Send magic link email
      const { error: emailError } = await supabase.functions.invoke("send-magic-link", {
        body: {
          email: submission.email,
          name: submission.name,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        toast({
          title: "Profile Approved",
          description: "Profile was approved but email could not be sent. Please send manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Approved",
          description: "Profile approved and welcome email sent!",
        });
      }

      fetchSubmissions();
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve profile",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (submission: SubmissionType) => {
    try {
      const { error } = await supabase
        .from("women")
        .update({ status: "NOT_APPROVED" })
        .eq("id", submission.id);

      if (error) throw error;

      toast({
        title: "Profile Rejected",
        description: "Profile has been rejected",
      });

      fetchSubmissions();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject profile",
        variant: "destructive",
      });
    }
  };

  const getDaysAgo = (dateString: string) => {
    const diffTime = Math.abs(Date.now() - new Date(dateString).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-background via-accent/30 to-background border-b border-border/40">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Profile Submissions</h2>
          <p className="text-muted-foreground">
            {submissions.filter(s => s.status === "PENDING_APPROVAL").length} pending approval,{" "}
            {submissions.filter(s => s.status === "NOT_APPROVED").length} rejected
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No submissions to review</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{submission.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={submission.status === "PENDING_APPROVAL" ? "secondary" : "destructive"}>
                        {submission.status?.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getDaysAgo(submission.created_at)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Email:</p>
                      <p className="text-sm text-muted-foreground">{submission.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Job Title:</p>
                      <p className="text-sm text-muted-foreground">{submission.job_title || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company:</p>
                      <p className="text-sm text-muted-foreground">{submission.company_name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Interested In:</p>
                      <p className="text-sm text-muted-foreground">{submission.interested_in || "Not specified"}</p>
                    </div>
                  </div>

                  {submission.short_bio && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Short Bio:</p>
                      <p className="text-sm text-muted-foreground">{submission.short_bio}</p>
                    </div>
                  )}

                  {submission.areas_of_expertise && submission.areas_of_expertise.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Areas of Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {submission.areas_of_expertise.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.status === "PENDING_APPROVAL" && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApprove(submission)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(submission)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}