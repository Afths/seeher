import { useState } from "react";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TalentCard } from "@/components/TalentCard";
import { SearchFilters } from "@/components/SearchFilters";
import { ProfileModal } from "@/components/ProfileModal";
import { ProfileSubmissionModal } from "@/components/ProfileSubmissionModal";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
type Woman = Tables<"women">;
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
  const [searchInput, setSearchInput] = useState("");
  const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const handleCardClick = (woman: Woman) => {
    setSelectedWoman(woman);
    setIsModalOpen(true);
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
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/lovable-uploads/bcb785a6-c1d7-4598-8bfc-3c9b5f2a8ec7.png" alt="SeeHer Logo" className="h-12" />
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={handleOpenSubmissionModal} className="rounded-xl">
                Submit Profile
              </Button>
              {user && (
                <Button variant="outline" onClick={signOut} className="rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
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
                <TabsTrigger value="speaker" className="rounded-lg">Speaker</TabsTrigger>
                <TabsTrigger value="panelist" className="rounded-lg">Panelist</TabsTrigger>
                <TabsTrigger value="board member" className="rounded-lg">Board Member</TabsTrigger>
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
              <Button onClick={handleSearch} className="rounded-xl px-6" disabled={loading}>
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
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
                  {results.map(person => <TalentCard key={person.id} name={person.name} companyName={person.company_name || undefined} jobTitle={person.job_title || undefined} shortBio={person.short_bio || undefined} profilePictureUrl={person.profile_picture_url || undefined} keywords={person.keywords || []} socialMediaLinks={person.social_media_links} languages={person.languages || []} onClick={() => handleCardClick(person)} />)}
                </div>
                
                {results.length === 0 && <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found. Try adjusting your search or filters.</p>
                  </div>}
              </div>}
          </div>
        </div>
      </div>
      
      <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} woman={selectedWoman} />
      
      <ProfileSubmissionModal isOpen={isSubmissionModalOpen} onClose={handleCloseSubmissionModal} />
    </div>;
};
export default Index;