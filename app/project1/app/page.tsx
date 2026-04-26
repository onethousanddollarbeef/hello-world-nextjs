import Project1AppPageContent from "@/app/project1/app-page-content";

type Project1AppPageProps = {
    searchParams?: Promise<{
        i?: string;
        vote?: string;
        reason?: string;
        showVotes?: string;
    }>;
};

export default async function Project1AppPage({ searchParams }: Project1AppPageProps) {
    return <Project1AppPageContent searchParams={searchParams} />;
}
