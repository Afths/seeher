import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSuggestExpertise() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const suggestExpertise = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('suggest-expertise');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Expertise Suggestions Complete",
        description: `${data.updatedCount} profiles updated with AI-suggested areas of expertise`,
      });

      return data;
    } catch (error) {
      console.error('Error suggesting expertise:', error);
      toast({
        title: "Error",
        description: "Failed to generate expertise suggestions. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestExpertise,
    isLoading,
  };
}