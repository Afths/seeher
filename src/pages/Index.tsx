import { useState } from "react";
import { Search, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TalentCard } from "@/components/TalentCard";
import { SearchFilters } from "@/components/SearchFilters";
import { ProfileModal } from "@/components/ProfileModal";
import { ProfileSubmissionModal } from "@/components/ProfileSubmissionModal";
import { SignInModal } from "@/components/SignInModal";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Tables } from "@/integrations/supabase/types";
type Woman = Tables<"women">;
type WomanPublic = Pick<Woman, "id" | "name" | "job_title" | "company_name" | "nationality" | "short_bio" | "long_bio" | "profile_picture_url" | "areas_of_expertise" | "languages" | "keywords" | "memberships" | "interested_in" | "created_at" | "social_media_links"> & {
  status: string | null;
};
const Index = () => {
  const {
    results,
    loading,
    filters,
    setFilters,
    performSearch,
    allLanguages,
    allAreasOfExpertise,
    allMemberships
  } = useTalentSearch();
  const {
    user,
    signOut
  } = useAuth();
  const {
    isAdmin
  } = useIsAdmin();
  const [searchInput, setSearchInput] = useState("");
  const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const handleCardClick = async (woman: WomanPublic) => {
    // Fetch full profile data including sensitive fields for modal display
    const {
      data: fullProfile
    } = await supabase.from("women").select("*").eq("id", woman.id).single();
    if (fullProfile) {
      setSelectedWoman(fullProfile);
      setIsModalOpen(true);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWoman(null);
  };
  const handleOpenSubmissionModal = () => {
    setIsSubmissionModalOpen(true);
  };
  const handleCloseSubmissionModal = () => {
    setIsSubmissionModalOpen(false);
  };
  const handleOpenSignInModal = () => {
    setIsSignInModalOpen(true);
  };
  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false);
  };
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchInput
    }));
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handleTabChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      interestedIn: value
    }));
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-background via-accent/30 to-background border-b border-border/40">
        <div className="container mx-auto px-6 py-[10px]">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            
            <div className="flex items-center">
              <img src="/lovable-uploads/c78fd2de-1860-470e-826c-241b2a3a2f4f.png" alt="SeeHer Logo" className="h-16" />
            </div>
            
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-4">
              <Button onClick={handleOpenSubmissionModal} size="sm" className="rounded-xl">
                Submit Profile
              </Button>
              {user ? <>
                  {isAdmin && <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => window.location.href = '/admin'}>
                      Admin Dashboard
                    </Button>}
                  <Button variant="outline" onClick={signOut} size="sm" className="rounded-xl">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </> : <Button variant="outline" onClick={handleOpenSignInModal} size="sm" className="rounded-xl">
                  Sign In
                </Button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Controls */}
        <div className="mb-8 space-y-6">
          {/* Interest Tabs - Centered */}
          <div className="flex justify-center">
            <Tabs value={filters.interestedIn} onValueChange={handleTabChange}>
              <TabsList className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-1">
                <TabsTrigger value="all" className="rounded-lg text-sm font-medium uppercase">ALL</TabsTrigger>
                <TabsTrigger value="speaker" className="rounded-lg text-sm font-medium uppercase">SPEAKER</TabsTrigger>
                <TabsTrigger value="panelist" className="rounded-lg text-sm font-medium uppercase">PANELIST</TabsTrigger>
                <TabsTrigger value="board member" className="rounded-lg text-sm font-medium uppercase">BOARD MEMBER</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Box - Full Width */}
          <div className="w-full">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input placeholder="Search by name, bio, expertise, keywords..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyPress={handleKeyPress} className="bg-card/50 backdrop-blur-sm border-border/40 rounded-xl pl-4 pr-12" />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button onClick={handleSearch} size="sm" className="rounded-xl px-6" disabled={loading}>
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Filters - Now at top for all screen sizes */}
        <div className="mb-8">
          <SearchFilters languages={allLanguages} areasOfExpertise={allAreasOfExpertise} memberships={allMemberships} selectedLanguages={filters.languages} selectedAreasOfExpertise={filters.areasOfExpertise} selectedMemberships={filters.memberships} onLanguageChange={languages => setFilters(prev => ({
          ...prev,
          languages
        }))} onAreasOfExpertiseChange={areas => setFilters(prev => ({
          ...prev,
          areasOfExpertise: areas
        }))} onMembershipsChange={memberships => setFilters(prev => ({
          ...prev,
          memberships
        }))} />
        </div>

        {/* Results */}
        <div>
          {loading ? <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Searching...</p>
            </div> : <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {results.length} {results.length === 1 ? 'result' : 'results'} found
                </p>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {results.map(person => <TalentCard key={person.id} name={person.name} companyName={person.company_name || undefined} jobTitle={person.job_title || undefined} shortBio={person.short_bio || undefined} profilePictureUrl={person.profile_picture_url || undefined} keywords={person.keywords || []} socialMediaLinks={person.social_media_links} languages={person.languages || []} areasOfExpertise={person.areas_of_expertise || []} onClick={() => handleCardClick(person as any)} />)}
              </div>
              
              {results.length === 0 && <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found. Try adjusting your search or filters.</p>
                </div>}
            </div>}
        </div>
      </div>
      
      <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} woman={selectedWoman} />
      
      <ProfileSubmissionModal isOpen={isSubmissionModalOpen} onClose={handleCloseSubmissionModal} />
      
      <SignInModal isOpen={isSignInModalOpen} onClose={handleCloseSignInModal} />
    </div>;
};
export default Index;