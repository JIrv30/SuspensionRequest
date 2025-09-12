// useStudents.js
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

export function useStudents(search = "") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('')
      
      let query = supabase
      .from("students")
      .select("student_name")
      .order('student_name',{ascending: true})
      .limit(50);

      const q = (typeof search === 'string' ? search.trim() : '')
      if(q) {
        query = query.ilike('student_name', `%${q}%`)
      }

      
      const { data, error } = await query;
      if (!mounted) return

      if (error) {
        console.error('students fetch error', error)
        setError(error.message)
        setData([])
      } else {
        setData(data || [])
      }
      setLoading(false)
    }

    load();
    return () => { mounted = false; };
  }, [search]);

  return { data, loading, error };
}
