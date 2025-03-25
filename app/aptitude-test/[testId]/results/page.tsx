import ResultsClientPage from './results-client'

// Allow dynamic parameters at runtime
export const dynamicParams = true;

export function generateStaticParams() {
  // This is required for static export with dynamic routes
  return [{ testId: 'placeholder' }]
}

export default function TestResultsPage({ params }: { params: { testId: string } }) {
  return <ResultsClientPage params={params} />
}
