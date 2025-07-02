import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Woman = Tables<"women">;

interface SearchFilters {
  interestedIn: string;
  searchTerm: string;
  languages: string[];
  areasOfExpertise: string[];
  memberships: string[];
}

export function useTalentSearch() {
  const [results, setResults] = useState<Woman[]>([]);
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
      const { data } = await supabase.from("women").select("languages, areas_of_expertise, memberships");
      
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
      let query = supabase.from("women").select("*");
      
      // Filter by interested_in (currently string, will be array later)
      if (filters.interestedIn) {
        query = query.eq("interested_in", filters.interestedIn);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let filteredResults = data || [];
      
      // Apply text search across all relevant fields
      if (filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase();
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
      
      // Apply array filters client-side
      if (filters.languages.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.languages?.some(lang => filters.languages.includes(lang))
        );
      }
      
      if (filters.areasOfExpertise.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.areas_of_expertise?.some(area => filters.areasOfExpertise.includes(area))
        );
      }
      
      if (filters.memberships.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.memberships?.some(membership => filters.memberships.includes(membership))
        );
      }
      
      setResults(filteredResults);
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