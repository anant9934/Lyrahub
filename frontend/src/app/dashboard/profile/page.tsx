"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeDropzone } from "@/components/features/profile/ResumeDropzone";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: () => apiGet("/students/me"),
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: "",
        github_url: "",
        linkedin_url: "",
        portfolio_url: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || "",
                github_url: profile.github_url || "",
                linkedin_url: profile.linkedin_url || "",
                portfolio_url: profile.portfolio_url || "",
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: typeof formData) => apiPatch("/students/me", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setIsEditing(false);
        },
    });

    if (isLoading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Basic Information</CardTitle>
                    <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Bio</label>
                                <Input value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">LinkedIn URL</label>
                                <Input value={formData.linkedin_url} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">GitHub URL</label>
                                <Input value={formData.github_url} onChange={(e) => setFormData({...formData, github_url: e.target.value})} />
                            </div>
                            <Button onClick={() => updateProfile.mutate(formData)} disabled={updateProfile.isPending}>
                                {updateProfile.isPending 
                                    ? "Submitting..." 
                                    : (user?.role === "faculty" || user?.roles?.some((r: any) => r.name?.toLowerCase() === "faculty"))
                                        ? "Submit for HOD Approval" 
                                        : "Save Changes"}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-muted-foreground font-medium">Reg No:</span> {profile?.reg_no}</div>
                            <div><span className="text-muted-foreground font-medium">CGPA:</span> {profile?.cgpa || 'N/A'}</div>
                            <div className="col-span-2"><span className="text-muted-foreground font-medium">Bio:</span> {profile?.bio || 'Not provided'}</div>
                            <div><span className="text-muted-foreground font-medium">LinkedIn:</span> {profile?.linkedin_url || 'Not provided'}</div>
                            <div><span className="text-muted-foreground font-medium">GitHub:</span> {profile?.github_url || 'Not provided'}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resume Upload</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResumeDropzone onSuccess={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} />
                </CardContent>
            </Card>
        </div>
    );
}
