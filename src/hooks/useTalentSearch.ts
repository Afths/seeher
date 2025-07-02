import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { searchFiltersSchema, sanitizeInput } from "@/lib/validation";

type Woman = Tables<"women">;

// Type for the public view (excludes sensitive fields)
type WomanPublic = Pick<Woman, 
  | "id" 
  | "name" 
  | "job_title" 
  | "company_name" 
  | "nationality" 
  | "short_bio" 
  | "long_bio" 
  | "profile_picture_url" 
  | "areas_of_expertise" 
  | "languages" 
  | "keywords" 
  | "memberships" 
  | "interested_in" 
  | "created_at"
  | "social_media_links"
> & {
  status: string | null;
};

interface SearchFilters {
  interestedIn: string;
  searchTerm: string;
  languages: string[];
  areasOfExpertise: string[];
  memberships: string[];
}

export function useTalentSearch() {
  const [results, setResults] = useState<WomanPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);
  const [allAreasOfExpertise, setAllAreasOfExpertise] = useState<string[]>([]);
  const [allMemberships, setAllMemberships] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    interestedIn: "speaker",
    searchTerm: "",
    languages: [],
    areasOfExpertise: [],
    memberships: []
  });

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      // Use direct table access for filter options (admin-level access needed)
      const { data } = await supabase.from("women").select("languages, areas_of_expertise, memberships").eq("status", "APPROVED");
      
      if (data) {
        const languages = new Set<string>();
        const areas = new Set<string>();
        const memberships = new Set<string>();
        
        data.forEach(item => {
          item.languages?.forEach(lang => languages.add(lang));
          item.areas_of_expertise?.forEach(area => areas.add(area));
          item.memberships?.forEach(membership => memberships.add(membership));
        });
        
        setAllLanguages(Array.from(languages).sort());
        setAllAreasOfExpertise(Array.from(areas).sort());
        setAllMemberships(Array.from(memberships).sort());
      }
    };
    
    loadFilterOptions();
  }, []);

  // Perform search
  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Validate search filters
      const validatedFilters = searchFiltersSchema.parse(filters);
      
      // Use the secure public view that excludes sensitive data
      let query = supabase.from("women_public").select("*");
      
      // Filter by interested_in (now array, check if current filter is in the array)
      if (filters.interestedIn) {
        query = query.contains("interested_in", [filters.interestedIn]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log("Raw data from Supabase:", data?.length, "records");
      
      let filteredResults = data || [];
      
      // Apply text search across all relevant fields
      if (filters.searchTerm.trim()) {
        const searchTerm = sanitizeInput(filters.searchTerm.toLowerCase());
        filteredResults = filteredResults.filter(item => {
          const matchesText = (
            item.long_bio?.toLowerCase().includes(searchTerm) ||
            item.short_bio?.toLowerCase().includes(searchTerm) ||
            item.job_title?.toLowerCase().includes(searchTerm) ||
            item.name?.toLowerCase().includes(searchTerm) ||
            item.company_name?.toLowerCase().includes(searchTerm)
          );
          
          const matchesKeywords = item.keywords?.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          ) || false;
          
          const matchesAreas = item.areas_of_expertise?.some(area => 
            area.toLowerCase().includes(searchTerm)
          ) || false;
          
          const matchesMemberships = item.memberships?.some(membership => 
            membership.toLowerCase().includes(searchTerm)
          ) || false;
          
          return matchesText || matchesKeywords || matchesAreas || matchesMemberships;
        });
      }
      
      // Apply array filters client-side with correct OR/AND logic
      // Languages filter: OR within filter (if English and Spanish selected, must have English OR Spanish)
      if (filters.languages.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.languages?.some(lang => filters.languages.includes(lang))
        );
      }
      
      // Areas of expertise filter: AND between filters, OR within filter (if Business and Tech selected, must have Business OR Tech)
      if (filters.areasOfExpertise.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.areas_of_expertise?.some(area => filters.areasOfExpertise.includes(area))
        );
      }
      
      // Memberships filter: OR within filter (if Member1 and Member2 selected, must have Member1 OR Member2)
      if (filters.memberships.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.memberships?.some(membership => filters.memberships.includes(membership))
        );
      }
      
      // Sort by completeness (most complete profiles first)
      const sortByCompleteness = (profiles: any[]) => {
        return profiles.sort((a, b) => {
          const getCompleteness = (profile: any) => {
            const fields = [
              'name', 'job_title', 'company_name', 'nationality', 
              'short_bio', 'long_bio', 'profile_picture_url',
              'areas_of_expertise', 'languages', 'keywords', 'memberships'
            ];
            
            let score = 0;
            fields.forEach(field => {
              const value = profile[field];
              if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                  score += value.length > 0 ? 1 : 0;
                } else if (typeof value === 'string') {
                  score += value.trim().length > 0 ? 1 : 0;
                } else {
                  score += 1;
                }
              }
            });
            return score;
          };
          
          return getCompleteness(b) - getCompleteness(a); // Descending order
        });
      };
      
      const sortedResults = sortByCompleteness(filteredResults);
      setResults(sortedResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when filters change
  useEffect(() => {
    performSearch();
  }, [filters]);

  // Initial load
  useEffect(() => {
    performSearch();
  }, []);

  return {
    results,
    loading,
    filters,
    setFilters,
    performSearch,
    allLanguages,
    allAreasOfExpertise,
    allMemberships
  };
}