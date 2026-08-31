import { render} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import { ProjectsPage } from '../ProjectsPage';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProjectsPage', () => {
  it('shows loading state', () => {
    renderPage();
    // Loading indicator check — spinner present
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});