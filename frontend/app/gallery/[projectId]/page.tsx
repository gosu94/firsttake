import ProjectGalleryClient from './ProjectGalleryClient';

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ projectId: 'placeholder' }];
}

export default function ProjectGalleryPage({ params }: { params: { projectId: string } }) {
    return <ProjectGalleryClient projectId={params.projectId} />;
}
