const { data, error } = tableName
    ? await supabase.from(tableName).select("*").eq("is_public", true).limit(200)
    : { data: null, error: null };