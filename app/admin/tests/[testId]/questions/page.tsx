import ManageQuestionsClient from './manage-questions-client'

// We need to add dynamicParams: true to allow runtime dynamic values
export const dynamicParams = true;

export function generateStaticParams() {
  // This is required for static export with dynamic routes
  // For admin routes, provide placeholder values to satisfy build
  return [
    { testId: 'placeholder' },
    // Include the specific IDs from error messages for testing
    { testId: 'jd7762f8kjppdjfgdczaggrqph7c87p0' },
    { testId: 'jd79fxyeq3gmdbns6gxv9drx817c9k40' }
  ]
}

export default function ManageQuestionsPage({ params }: { params: { testId: string } }) {
  return <ManageQuestionsClient params={params} />
}
