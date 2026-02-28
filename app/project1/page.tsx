type CaptionRow = {
    id: string;
    content?: string | null;
    image_id?: string | null;
    is_public?: boolean | null;
};

// ...

const { data: captionsData, error: captionsError } = await supabase
    .from("captions")
    .select("id,content,image_id,is_public")
    .eq("is_public", true)
    .order("id", { ascending: false })
    .limit(200);